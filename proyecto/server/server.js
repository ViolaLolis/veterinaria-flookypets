const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "veterinaria",
});

// Conexión
db.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err.stack);
    return;
  }
  console.log("Conectado a la base de datos con ID " + db.threadId);
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente con base de datos.");
});

// Ruta: Obtener usuarios
app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error obteniendo usuarios:", err);
      return res.status(500).json({ error: "Error obteniendo datos" });
    }
    res.json(results);
  });
});

// Ruta: Registro de usuario
// Ruta: Registro de usuario (versión corregida)
app.post("/register", async (req, res) => {
  const { 
    nombre, 
    apellido, 
    email, 
    password, 
    telefono, 
    direccion, 
    tipoDocumento, 
    numeroDocumento, 
    fechaNacimiento 
  } = req.body;

  console.log("Datos recibidos en backend:", req.body);

  // Campos obligatorios actualizados
  if (!email || !password || !nombre || !apellido || !telefono) {
    return res.status(400).json({ 
      message: "Email, contraseña, nombre, apellido y teléfono son obligatorios" 
    });
  }

  try {
    // Verificar si el correo ya existe
    const [existingUser] = await db.promise().query(
      "SELECT * FROM usuarios WHERE email = ?", 
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario con todos los campos
    const [result] = await db.promise().query(
      `INSERT INTO usuarios 
      (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, 
        hashedPassword, 
        nombre, 
        apellido, 
        telefono, 
        direccion || null, 
        tipoDocumento || null, 
        numeroDocumento || null, 
        fechaNacimiento || null
      ]
    );

    res.status(201).json({
      id: result.insertId,
      email,
      nombre,
      apellido,
      telefono
    });

  } catch (err) {
    console.error("Error en el registro:", err);
    res.status(500).json({ 
      message: "Error al registrar el usuario", 
      error: err.message 
    });
  }
});

// Ruta: Actualizar estado del usuario
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("UPDATE users SET active = !active WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error actualizando usuario:", err);
      return res.status(500).json({ error: "Error actualizando usuario" });
    }
    res.json({ success: true });
  });
});

// Ruta: Login de usuarios
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error al verificar el usuario", error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    const user = results[0];

    // Verificación con bcrypt
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: "Error en la comparación de contraseñas", error: err });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Correo o contraseña incorrectos" });
      }

      // Login exitoso
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });
    });
  });
});

// Ruta para solicitar restablecimiento de contraseña
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      success: false,
      message: 'El correo electrónico es requerido' 
    });
  }

  try {
    // Verificar si el usuario existe
    const [user] = await db.promise().query(
      'SELECT * FROM usuarios WHERE email = ?', 
      [email]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No existe un usuario con este correo' 
      });
    }
    

    // Generar token de restablecimiento (6 caracteres)
    const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora de expiración

    // Guardar el token en la base de datos
    await db.promise().query(
      'UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [resetToken, expiresAt, email]
    );

    res.json({ 
      success: true,
      resetToken, // En desarrollo podemos devolverlo para pruebas
      message: 'Se ha enviado un correo con instrucciones' 
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al procesar la solicitud' 
    });
  }
});
 
// Ruta para actualizar la contraseña
// Ruta para verificar el código de restablecimiento
app.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ 
      success: false,
      message: 'Email y código son requeridos' 
    });
  }

  try {
    // Verificar si el código coincide y no ha expirado
    const [user] = await db.promise().query(
      'SELECT * FROM usuarios WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()',
      [email, code]
    );

    if (user.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Código inválido o expirado' 
      });
    }

    res.json({ 
      success: true,
      message: 'Código verificado correctamente' 
    });

  } catch (error) {
    console.error('Error en verify-reset-code:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al verificar el código' 
    });
  }
});
// En point de olvide contraseña 
// Ruta: Restablecer la contraseña
app.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ 
      success: false,
      message: 'Email, token y nueva contraseña son requeridos' 
    });
  }

  try {
    // Buscar usuario con el token válido y no expirado
    const [user] = await db.promise().query(
      'SELECT * FROM usuarios WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()',
      [email, token]
    );

    if (user.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Token inválido o expirado' 
      });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña y limpiar el token
    await db.promise().query(
      'UPDATE usuarios SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({ 
      success: true,
      message: 'Contraseña actualizada correctamente' 
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al cambiar la contraseña' 
    });
  }
});

// Ruta: Obtener todos los clientes
app.get("/clientes", (req, res) => {
  db.query("SELECT * FROM clientes", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error al obtener los clientes", error: err });
    }
    res.json(results);
  });
});

// Ruta: Registrar nuevo cliente
app.post("/register", async (req, res) => {
  // Asegúrate de recibir todos los campos necesarios
  const { nombre, apellido, email, password, telefono, direccion, tipoDocumento, numeroDocumento, fechaNacimiento } = req.body;

  console.log("Datos recibidos:", req.body); // Para depuración

  // Validación actualizada con todos los campos obligatorios
  const camposObligatorios = [
    { field: 'nombre', value: nombre, name: 'Nombre' },
    { field: 'apellido', value: apellido, name: 'Apellido' },
    { field: 'email', value: email, name: 'Email' },
    { field: 'password', value: password, name: 'Contraseña' },
    { field: 'telefono', value: telefono, name: 'Teléfono' }
  ];

  const camposFaltantes = camposObligatorios.filter(campo => !campo.value);
  
  if (camposFaltantes.length > 0) {
    const mensajeError = `Faltan campos obligatorios: ${camposFaltantes.map(c => c.name).join(', ')}`;
    console.error("Error de validación:", mensajeError);
    return res.status(400).json({ message: mensajeError });
  }

  try {
    // Verificar si el correo ya existe
    const [existingUser] = await db.promise().query(
      "SELECT * FROM clientes WHERE email = ?", 
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo cliente con todos los campos
    const [result] = await db.promise().query(
      `INSERT INTO clientes 
      (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, 
        hashedPassword, 
        nombre, 
        apellido, 
        telefono, 
        direccion || null, 
        tipoDocumento || null, 
        numeroDocumento || null, 
        fechaNacimiento || null
      ]
    );

    res.status(201).json({
      id: result.insertId,
      email,
      nombre,
      apellido,
      telefono
    });

  } catch (err) {
    console.error("Error en el registro:", err);
    res.status(500).json({ 
      message: "Error al registrar el cliente", 
      error: err.message 
    });
  }
});

// Ruta: Obtener citas del día
app.get("/api/citas/hoy", (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];

  db.query(`
    SELECT c.id, c.fecha, cl.nombre AS propietario, 
           c.nombre_mascota AS mascota, cl.direccion AS direccion, 
           c.servicio, c.tipo_mascota, c.estado
    FROM citas c
    JOIN clientes cl ON c.id_cliente = cl.id_cliente
    WHERE DATE(c.fecha) = ?
    ORDER BY c.fecha ASC
  `, [hoy], (err, results) => {
    if (err) {
      console.error("Error obteniendo citas:", err);
      return res.status(500).json({ error: "Error al obtener citas" });
    }
    res.json(results);
  });
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
// Obtener estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    // Veterinarios
    const [vets] = await db.promise().query(
      "SELECT COUNT(*) as count FROM usuarios WHERE role = 'veterinario'"
    );
    
    // Clientes
    const [clients] = await db.promise().query(
      "SELECT COUNT(*) as count FROM clientes"
    );
    
    // Mascotas (asumiendo que hay una tabla mascotas)
    const [pets] = await db.promise().query(
      "SELECT COUNT(*) as count FROM mascotas"
    );
    
    // Citas hoy
    const today = new Date().toISOString().split('T')[0];
    const [appointments] = await db.promise().query(
      "SELECT COUNT(*) as count FROM citas WHERE DATE(fecha) = ?",
      [today]
    );
    
    res.json({
      veterinarios: vets[0].count,
      clientes: clients[0].count,
      mascotas: pets[0].count,
      citasHoy: appointments[0].count
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtener citas de la semana para el gráfico
app.get('/api/citas/semana', async (req, res) => {
  try {
    const [results] = await db.promise().query(`
      SELECT 
        DAYNAME(fecha) as dia, 
        COUNT(*) as citas
      FROM citas
      WHERE fecha BETWEEN DATE_SUB(NOW(), INTERVAL 6 DAY) AND NOW()
      GROUP BY DAYNAME(fecha)
      ORDER BY fecha
    `);
    
    // Formatear para recharts
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const formattedData = daysOrder.map(day => {
      const found = results.find(r => r.dia === day);
      return {
        dia: day.substring(0, 3), // Lun, Mar, etc.
        citas: found ? found.citas : 0
      };
    });
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error al obtener citas semanales:', error);
    res.status(500).json({ error: 'Error al obtener citas semanales' });
  }
});

// CRUD para personal
app.get('/api/staff', async (req, res) => {
  try {
    const [results] = await db.promise().query(
      "SELECT * FROM usuarios WHERE role IN ('admin', 'veterinario')"
    );
    res.json(results);
  } catch (error) {
    console.error('Error al obtener personal:', error);
    res.status(500).json({ error: 'Error al obtener personal' });
  }
});

app.post('/api/staff', async (req, res) => {
  const { nombre, apellido, email, telefono, role } = req.body;
  
  try {
    // Generar contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const [result] = await db.promise().query(
      `INSERT INTO usuarios 
      (email, password, nombre, apellido, telefono, role) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, nombre, apellido, telefono, role]
    );
    
    // Enviar email con credenciales (simulado)
    console.log(`Credenciales para ${email}: contraseña temporal ${tempPassword}`);
    
    res.status(201).json({
      id: result.insertId,
      email,
      nombre,
      apellido,
      telefono,
      role
    });
  } catch (error) {
    console.error('Error al agregar personal:', error);
    res.status(500).json({ error: 'Error al agregar personal' });
  }
});

app.put('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, telefono, role } = req.body;
  
  try {
    await db.promise().query(
      `UPDATE usuarios SET 
      nombre = ?, apellido = ?, email = ?, telefono = ?, role = ?
      WHERE id = ?`,
      [nombre, apellido, email, telefono, role, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar personal:', error);
    res.status(500).json({ error: 'Error al actualizar personal' });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.promise().query(
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar personal:', error);
    res.status(500).json({ error: 'Error al eliminar personal' });
  }
});
<<<<<<< HEAD

// Ruta para obtener todos los propietarios (usuarios con rol 'usuario')
app.get('/api/propietarios', async (req, res) => {
  try {
    const [results] = await db.promise().query(
      'SELECT id, nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento FROM usuarios WHERE role = "usuario"'
    );
    res.json(results);
  } catch (err) {
    console.error('Error al obtener propietarios:', err);
    res.status(500).json({ error: 'Error al obtener propietarios' });
  }
});

// Obtener todos los propietarios
app.get('/api/propietarios', async (req, res) => {
  try {
    const [results] = await db.promise().query(
      'SELECT id, nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento FROM usuarios WHERE role = "usuario"'
    );
    res.json(results);
  } catch (err) {
    console.error('Error al obtener propietarios:', err);
    res.status(500).json({ error: 'Error al obtener propietarios' });
  }
});

// Deshabilitar propietario
app.put('/api/propietarios/:id/disable', async (req, res) => {
  try {
    await db.promise().query(
      'UPDATE usuarios SET active = 0 WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error al deshabilitar propietario:', err);
    res.status(500).json({ error: 'Error al deshabilitar propietario' });
  }
});

// Ruta para deshabilitar propietario
app.put('/api/propietarios/:id/disable', async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'UPDATE usuarios SET active = 0 WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }
    
    res.json({ success: true, message: 'Propietario deshabilitado correctamente' });
  } catch (err) {
    console.error('Error al deshabilitar propietario:', err);
    res.status(500).json({ 
      error: 'Error al deshabilitar propietario',
      details: err.message 
    });
  }
});

=======
// Obtener estadísticas corregidas
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [vets] = await db.promise().query(
      "SELECT COUNT(*) as count FROM usuarios WHERE role = 'veterinario'"
    );
    
    const [owners] = await db.promise().query(
      "SELECT COUNT(*) as count FROM clientes"
    );
    
    const [admins] = await db.promise().query(
      "SELECT COUNT(*) as count FROM usuarios WHERE role = 'admin'"
    );
    
    const today = new Date().toISOString().split('T')[0];
    const [appointments] = await db.promise().query(
      "SELECT COUNT(*) as count FROM citas WHERE DATE(fecha) = ?",
      [today]
    );
    
    res.json({
      veterinarios: vets[0].count,
      propietarios: owners[0].count,
      administradores: admins[0].count,
      citasHoy: appointments[0].count
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Endpoint para citas mensuales
app.get('/api/citas/mensuales', async (req, res) => {
  try {
    const [results] = await db.promise().query(`
      SELECT 
        WEEK(fecha, 1) as semana,
        COUNT(*) as citas
      FROM citas
      WHERE fecha BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()
      GROUP BY WEEK(fecha, 1)
    `);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas mensuales' });
  }
});

// Nuevos endpoints para servicios y citas
app.get('/api/servicios', (req, res) => {
  db.query("SELECT * FROM servicios", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/citas', async (req, res) => {
  const { id_cliente, id_servicio, fecha } = req.body;
  
  try {
    const [result] = await db.promise().query(
      "INSERT INTO citas (id_cliente, id_servicio, fecha, estado) VALUES (?, ?, ?, 'pendiente')",
      [id_cliente, id_servicio, fecha]
    );
    
    res.status(201).json({ id_cita: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/citas/:id', async (req, res) => {
  const { id } = req.params;
  const { estado, id_veterinario, ubicacion } = req.body;
  
  try {
    await db.promise().query(
      "UPDATE citas SET estado = ?, id_veterinario = ?, ubicacion = ? WHERE id_cita = ?",
      [estado, id_veterinario, ubicacion, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/citas/veterinario/:id', (req, res) => {
  const { id } = req.params;
  
  db.query(`
    SELECT c.*, s.nombre as servicio, cl.nombre as cliente 
    FROM citas c
    JOIN servicios s ON c.id_servicio = s.id_servicio
    JOIN clientes cl ON c.id_cliente = cl.id_cliente
    WHERE c.id_veterinario = ? OR c.estado = 'pendiente'
  `, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
>>>>>>> 774c8fd396b64a414449d22024e997a7d6a6b101
