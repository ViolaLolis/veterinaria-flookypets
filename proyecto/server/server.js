const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // Usamos la versión promise-based
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto'); // Aunque no se usa directamente para generar el token numérico, es útil tenerlo
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

const app = express();
const PORT = process.env.PORT || 5000; // Usar puerto de .env o 5000 por defecto

// Middleware
app.use(cors());
app.use(express.json());

// Configuración del pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "veterinaria",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso no autorizado: Token no proporcionado." });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'your_secret_key', (err, user) => {
    if (err) {
      console.error("Error al verificar token:", err);
      return res.status(403).json({ message: "Acceso prohibido: Token inválido o expirado." });
    }
    req.user = user;
    next();
  });
};

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor de FlookyPets funcionando correctamente");
});

// Ruta de login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      role: user.role,
      token
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor al iniciar sesión." });
  }
});

// Ruta de registro
app.post("/register", async (req, res) => {
  const { nombre, apellido, email, password, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento } = req.body;

  // Validación básica
  if (!email || !password || !nombre || !telefono) {
    return res.status(400).json({ message: "Datos incompletos: email, password, nombre y teléfono son obligatorios." });
  }

  try {
    // Verificar si el usuario ya existe
    const [existingUsers] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado." });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios
         (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'usuario')`,
      [email, hashedPassword, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento]
    );

    res.status(201).json({
      id: result.insertId,
      email,
      nombre,
      apellido,
      role: 'usuario'
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error al registrar usuario." });
  }
});

// Ruta para solicitar/generar token de recuperación de contraseña
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "El correo electrónico es obligatorio." });
  }

  try {
    const [users] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (users.length === 0) {
      // Por seguridad, es mejor no revelar si el email existe o no.
      // Podrías enviar un mensaje genérico como "Si el correo existe, se ha enviado un código."
      // Pero para fines de depuración y para que el frontend sepa si continuar,
      // aquí retornamos 404. En un sistema real, se podría enviar un 200 OK
      // incluso si el usuario no existe, para evitar enumeración.
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Generar un token de recuperación numérico de 6 dígitos
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de expiración

    await pool.query(
      "UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
      [resetToken, resetTokenExpires, email]
    );

    // En producción, aquí enviarías un email real con el token
    console.log(`Token de recuperación para ${email}: ${resetToken}`); // Solo para depuración

    res.json({ message: "Token de recuperación generado y enviado (simulado).", resetToken: resetToken });

  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).json({ message: "Error en el servidor al generar el token de recuperación." });
  }
});

// NUEVA RUTA: Para verificar el token de recuperación antes de permitir el cambio de contraseña
app.post("/verify-reset-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Correo y código de verificación son obligatorios." });
  }

  try {
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ? AND reset_token = ?",
      [email, code]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Código inválido o correo incorrecto." });
    }

    const user = users[0];
    const now = new Date();
    // Convertir la fecha de la base de datos a un objeto Date para comparar
    if (new Date(user.reset_token_expires) < now) {
      // Limpiar el token expirado para evitar reusos
      await pool.query(
        "UPDATE usuarios SET reset_token = NULL, reset_token_expires = NULL WHERE email = ?",
        [email]
      );
      return res.status(400).json({ message: "El código de verificación ha expirado. Solicita uno nuevo." });
    }

    res.json({ message: "Código verificado exitosamente." });

  } catch (error) {
    console.error("Error en verify-reset-code:", error);
    res.status(500).json({ message: "Error en el servidor al verificar el código." });
  }
});


// Ruta para resetear la contraseña
app.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: "Correo, token y nueva contraseña son obligatorios." });
  }

  try {
    // Verificar token válido y no expirado
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()",
      [email, token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Token inválido o expirado. Por favor, solicita uno nuevo." });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar el token de recuperación
    // CORRECCIÓN: Añadir 'AND reset_token = ?' a la cláusula WHERE
    const [result] = await pool.query(
      "UPDATE usuarios SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ? AND reset_token = ?",
      [hashedPassword, email, token] // Asegúrate de pasar el token aquí
    );

    // Verificar si se actualizó alguna fila
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "No se pudo actualizar la contraseña. El usuario o token no coinciden." });
    }

    res.json({ message: "Contraseña actualizada correctamente." });

  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(500).json({ message: "Error en el servidor al resetear la contraseña." });
  }
});

// ==============================================
// RUTAS DE ADMINISTRACIÓN (requieren autenticación)
// ==============================================

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Acceso prohibido: Solo administradores." });
  }
  next();
};

// Obtener estadísticas para el dashboard
app.get("/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    // Consultas a la base de datos
    const [[{ citas }]] = await pool.query(
      `SELECT COUNT(*) as citas FROM citas
        WHERE MONTH(fecha) = MONTH(CURRENT_DATE())`
    );

    const [[{ veterinarios }]] = await pool.query(
      `SELECT COUNT(*) as veterinarios FROM usuarios
        WHERE role = 'veterinario'`
    );

    const [[{ admins }]] = await pool.query(
      `SELECT COUNT(*) as admins FROM usuarios
        WHERE role = 'admin'`
    );

    const [[{ mascotas }]] = await pool.query(
      `SELECT COUNT(*) as mascotas FROM mascotas`
    );

    const [[{ citasMesPasado }]] = await pool.query(
      `SELECT COUNT(*) as citasMesPasado FROM citas
        WHERE MONTH(fecha) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)` // Corregido para mes pasado
    );

    // Calcular crecimiento porcentual
    const growth = citasMesPasado > 0
      ? ((citas - citasMesPasado) / citasMesPasado * 100).toFixed(2)
      : 0;

    res.json({
      appointments: citas,
      vets: veterinarios,
      admins: admins,
      pets: mascotas,
      monthlyGrowth: growth
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: 'Error al obtener estadísticas.' });
  }
});

// Obtener usuarios con filtro por rol
app.get("/admin/users", authenticateToken, isAdmin, async (req, res) => {
  const { role } = req.query;

  try {
    let query = `SELECT id, email, nombre, apellido, telefono, direccion, role,
                   created_at FROM usuarios`;
    const params = [];

    if (role && role !== 'all') {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error al obtener usuarios.' });
  }
});

// Crear nuevo usuario (admin, veterinario, etc.)
app.post("/admin/users", authenticateToken, isAdmin, async (req, res) => {
  const {
    email,
    password,
    nombre,
    apellido,
    telefono,
    direccion,
    tipo_documento,
    numero_documento,
    fecha_nacimiento,
    role
  } = req.body;

  try {
    // Validación básica
    if (!email || !password || !nombre || !telefono || !role) {
      return res.status(400).json({ message: 'Datos incompletos para crear usuario.' });
    }

    // Verificar si el email ya existe
    const [existingUsers] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'El email ya está registrado.' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios
         (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        hashedPassword,
        nombre,
        apellido,
        telefono,
        direccion,
        tipo_documento,
        numero_documento,
        fecha_nacimiento,
        role
      ]
    );

    res.status(201).json({
      id: result.insertId,
      email,
      nombre,
      apellido,
      role
    });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: 'Error al crear usuario.' });
  }
});

// Actualizar usuario
app.put("/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    email, // Aunque no se actualiza el email, puede venir en el body
    password,
    nombre,
    apellido,
    telefono,
    direccion,
    tipo_documento,
    numero_documento,
    fecha_nacimiento,
    role
  } = req.body;

  try {
    let query = `UPDATE usuarios SET
        nombre = ?, apellido = ?, telefono = ?, direccion = ?,
        tipo_documento = ?, numero_documento = ?, fecha_nacimiento = ?, role = ?`;

    const params = [
      nombre,
      apellido,
      telefono,
      direccion,
      tipo_documento,
      numero_documento,
      fecha_nacimiento,
      role
    ];

    // Si se proporciona una nueva contraseña, actualizarla
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado para actualizar." });
    }

    res.json({ message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: 'Error al actualizar usuario.' });
  }
});

// Eliminar usuario
app.delete("/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado para eliminar." });
    }
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: 'Error al eliminar usuario.' });
  }
});

// CRUD para servicios
app.get("/admin/services", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [services] = await pool.query('SELECT * FROM servicios ORDER BY nombre');
    res.json(services);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ message: 'Error al obtener servicios.' });
  }
});

app.post("/admin/services", authenticateToken, isAdmin, async (req, res) => {
  const { nombre, descripcion, precio } = req.body;

  try {
    // Validación básica
    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ message: 'Datos incompletos para crear servicio.' });
    }

    const [result] = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, precio) VALUES (?, ?, ?)',
      [nombre, descripcion, precio]
    );

    res.status(201).json({
      id_servicio: result.insertId,
      nombre,
      descripcion,
      precio
    });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ message: 'Error al crear servicio.' });
  }
});

app.put("/admin/services/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE servicios SET nombre = ?, descripcion = ?, precio = ? WHERE id_servicio = ?',
      [nombre, descripcion, precio, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Servicio no encontrado para actualizar." });
    }

    res.json({
      id_servicio: id,
      nombre,
      descripcion,
      precio
    });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ message: 'Error al actualizar servicio.' });
  }
});

app.delete("/admin/services/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM servicios WHERE id_servicio = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Servicio no encontrado para eliminar." });
    }
    res.json({ message: 'Servicio eliminado correctamente.' });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ message: 'Error al eliminar servicio.' });
  }
});

// Ruta para programar reuniones con veterinarios
app.post("/admin/meetings", authenticateToken, isAdmin, async (req, res) => {
  const { title, date, time, description, participants } = req.body;

  try {
    // Validación básica
    if (!title || !date || !time || !participants || participants.length === 0) {
      return res.status(400).json({ message: 'Datos incompletos para programar reunión.' });
    }

    const meetingDateTime = new Date(`${date}T${time}:00`);

    // En un sistema real, aquí guardarías la reunión en una tabla específica
    // Por ejemplo: await pool.query('INSERT INTO reuniones (title, datetime, description) VALUES (?, ?, ?)', [title, meetingDateTime, description]);
    // Y luego una tabla de relación para los participantes:
    // await pool.query('INSERT INTO reunion_participantes (reunion_id, user_id) VALUES (?, ?)', [reunionId, participantId]);

    // Obtener información de los veterinarios participantes
    const [vets] = await pool.query(
      'SELECT id, nombre, apellido, email FROM usuarios WHERE id IN (?) AND role = "veterinario"',
      [participants]
    );

    // En producción, aquí enviarías notificaciones/emails a los veterinarios
    console.log('Reunión programada (simulada):', {
      title,
      dateTime: meetingDateTime,
      description,
      participants: vets
    });

    res.json({
      message: 'Reunión programada correctamente.',
      details: {
        title,
        dateTime: meetingDateTime,
        description,
        participants: vets
      }
    });
  } catch (error) {
    console.error("Error al programar reunión:", error);
    res.status(500).json({ message: 'Error al programar reunión.' });
  }
});

// Obtener citas recientes para el dashboard
app.get("/admin/recent-appointments", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [appointments] = await pool.query(`
      SELECT c.id_cita, c.fecha, c.estado,
             s.nombre as servicio,
             cl.nombre as cliente,
             u.nombre as veterinario
      FROM citas c
      LEFT JOIN servicios s ON c.id_servicio = s.id_servicio
      LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
      LEFT JOIN usuarios u ON c.id_veterinario = u.id
      ORDER BY c.fecha DESC
      LIMIT 10
    `);

    res.json(appointments);
  } catch (error) {
    console.error("Error al obtener citas recientes:", error);
    res.status(500).json({ message: 'Error al obtener citas recientes.' });
  }
});

// Ruta para obtener todos los propietarios (usuarios con rol 'usuario')
app.get('/api/propietarios', async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento FROM usuarios WHERE role = "usuario"'
    );
    res.json(results);
  } catch (err) {
    console.error('Error al obtener propietarios:', err);
    res.status(500).json({ error: 'Error al obtener propietarios.' });
  }
});

// Deshabilitar propietario
// NOTA: Tu esquema de DB no tiene una columna 'active'.
// Si quieres deshabilitar usuarios, necesitarás añadir 'active BOOLEAN DEFAULT TRUE' a tu tabla 'usuarios'.
// Por ahora, esta ruta asumirá que 'active' existe o no hará nada si no.
app.put('/api/propietarios/:id/disable', async (req, res) => {
  try {
    // Verifica si la columna 'active' existe en tu tabla 'usuarios'.
    // Si no existe, esta consulta fallará.
    // Deberías añadirla con: ALTER TABLE usuarios ADD COLUMN active BOOLEAN DEFAULT TRUE;
    const [result] = await pool.query(
      'UPDATE usuarios SET active = 0 WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Propietario no encontrado o ya deshabilitado.' });
    }

    res.json({ success: true, message: 'Propietario deshabilitado correctamente.' });
  } catch (err) {
    console.error('Error al deshabilitar propietario:', err);
    res.status(500).json({
      error: 'Error al deshabilitar propietario.',
      details: err.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de FlookyPets corriendo en http://localhost:${PORT}`);
});