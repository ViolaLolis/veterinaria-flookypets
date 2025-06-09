const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configuración del pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1013105346",
  database: process.env.DB_NAME || "veterinaria",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión a la base de datos
pool.getConnection()
  .then(conn => {
    console.log('Conectado a la base de datos MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('Error de conexión a la base de datos:', err);
    process.exit(1);
  });

// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }
  next();
};

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor de veterinaria funcionando correctamente");
});

// =============================================
// RUTAS DE AUTENTICACIÓN
// =============================================

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
      process.env.JWT_SECRET || 'your_secret_key',
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
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta de registro
app.post("/register", async (req, res) => {
  const { nombre, apellido, email, password, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento } = req.body;

  // Validación básica
  if (!email || !password || !nombre || !telefono) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  try {
    // Verificar si el usuario ya existe
    const [existingUsers] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
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
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// Ruta para recuperación de contraseña
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    // Generar token de recuperación (6 dígitos numéricos)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora de expiración

    await pool.query(
      "UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
      [resetToken, resetTokenExpires, email]
    );

    // En desarrollo, mostramos el token en la respuesta
    res.json({ 
      success: true,
      message: "Token de recuperación generado",
      resetToken: resetToken // Solo para desarrollo, no en producción
    });

  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor" 
    });
  }
});

// Ruta para verificar el código de recuperación
app.post("/verify-reset-code", async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ 
      success: false,
      message: "Email y token son requeridos" 
    });
  }

  try {
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    const user = users[0];
    
    if (!user.reset_token || user.reset_token !== token) {
      return res.status(400).json({ 
        success: false,
        message: "Token inválido" 
      });
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ 
        success: false,
        message: "Token expirado" 
      });
    }

    res.json({ 
      success: true,
      message: "Token válido"
    });

  } catch (error) {
    console.error("Error en verify-reset-code:", error);
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor" 
    });
  }
});

// Ruta para resetear contraseña
app.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ 
      success: false,
      message: "Todos los campos son requeridos" 
    });
  }

  try {
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()",
      [email, token]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Token inválido o expirado" 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE usuarios SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ?",
      [hashedPassword, email]
    );

    res.json({ 
      success: true,
      message: "Contraseña actualizada correctamente" 
    });

  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor" 
    });
  }
});

// =============================================
// RUTAS DEL PANEL DE ADMINISTRADOR
// =============================================

/**
 * OBTENER ESTADÍSTICAS PARA EL DASHBOARD
 * GET /admin/stats
 */
app.get("/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [[{totalUsers}]] = await pool.query(
      "SELECT COUNT(*) as totalUsers FROM usuarios WHERE role = 'usuario'"
    );
    
    const [[{totalVets}]] = await pool.query(
      "SELECT COUNT(*) as totalVets FROM usuarios WHERE role = 'veterinario'"
    );
    
    const [[{totalAdmins}]] = await pool.query(
      "SELECT COUNT(*) as totalAdmins FROM usuarios WHERE role = 'admin'"
    );
    
    const [[{totalServices}]] = await pool.query(
      "SELECT COUNT(*) as totalServices FROM servicios"
    );
    
    const [[{totalAppointments}]] = await pool.query(
      "SELECT COUNT(*) as totalAppointments FROM citas WHERE MONTH(fecha) = MONTH(CURRENT_DATE())"
    );
    
    const [[{lastMonthAppointments}]] = await pool.query(
      "SELECT COUNT(*) as lastMonthAppointments FROM citas WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) - 1"
    );
    
    const growth = lastMonthAppointments > 0 
      ? ((totalAppointments - lastMonthAppointments) / lastMonthAppointments * 100).toFixed(2)
      : 100;

    res.json({
      totalUsers,
      totalVets,
      totalAdmins,
      totalServices,
      totalAppointments,
      monthlyGrowth: parseFloat(growth)
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

/**
 * GESTIÓN DE SERVICIOS
 */
app.get("/servicios", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [services] = await pool.query("SELECT * FROM servicios");
    res.json(services);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ message: "Error al obtener servicios" });
  }
});

app.post("/servicios", authenticateToken, isAdmin, async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  
  if (!nombre || !descripcion || !precio) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO servicios (nombre, descripcion, precio) VALUES (?, ?, ?)",
      [nombre, descripcion, precio]
    );
    
    const [newService] = await pool.query(
      "SELECT * FROM servicios WHERE id_servicio = ?",
      [result.insertId]
    );
    
    res.status(201).json(newService[0]);
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ message: "Error al crear servicio" });
  }
});

app.put("/servicios/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;
  
  try {
    await pool.query(
      "UPDATE servicios SET nombre = ?, descripcion = ?, precio = ? WHERE id_servicio = ?",
      [nombre, descripcion, precio, id]
    );
    
    const [updatedService] = await pool.query(
      "SELECT * FROM servicios WHERE id_servicio = ?",
      [id]
    );
    
    res.json(updatedService[0]);
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ message: "Error al actualizar servicio" });
  }
});

app.delete("/servicios/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query("DELETE FROM servicios WHERE id_servicio = ?", [id]);
    res.json({ success: true, message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        message: "No se puede eliminar el servicio porque está asociado a citas existentes" 
      });
    }
    
    res.status(500).json({ message: "Error al eliminar servicio" });
  }
});

/**
 * GESTIÓN DE VETERINARIOS
 */
app.get("/usuarios/veterinarios", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [vets] = await pool.query(
      "SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE role = 'veterinario'"
    );
    res.json(vets);
  } catch (error) {
    console.error("Error al obtener veterinarios:", error);
    res.status(500).json({ message: "Error al obtener veterinarios" });
  }
});

app.post("/usuarios/veterinarios", authenticateToken, isAdmin, async (req, res) => {
  const { nombre, apellido, email, telefono, direccion, password } = req.body;
  
  if (!nombre || !email || !password || !telefono) {
    return res.status(400).json({ message: "Nombre, email, teléfono y contraseña son requeridos" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      `INSERT INTO usuarios 
      (nombre, apellido, email, telefono, direccion, password, role) 
      VALUES (?, ?, ?, ?, ?, ?, 'veterinario')`,
      [nombre, apellido, email, telefono, direccion, hashedPassword]
    );
    
    const [newVet] = await pool.query(
      "SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE id = ?",
      [result.insertId]
    );
    
    res.status(201).json(newVet[0]);
  } catch (error) {
    console.error("Error al crear veterinario:", error);
    res.status(500).json({ message: "Error al crear veterinario" });
  }
});

app.put("/usuarios/veterinarios/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, telefono, direccion } = req.body;
  
  try {
    await pool.query(
      "UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, direccion = ? WHERE id = ? AND role = 'veterinario'",
      [nombre, apellido, telefono, direccion, id]
    );
    
    const [updatedVet] = await pool.query(
      "SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE id = ?",
      [id]
    );
    
    res.json(updatedVet[0]);
  } catch (error) {
    console.error("Error al actualizar veterinario:", error);
    res.status(500).json({ message: "Error al actualizar veterinario" });
  }
});

app.delete("/usuarios/veterinarios/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [appointments] = await pool.query(
      "SELECT id_cita FROM citas WHERE id_veterinario = ?",
      [id]
    );
    
    if (appointments.length > 0) {
      return res.status(400).json({ 
        message: "No se puede eliminar el veterinario porque tiene citas asignadas" 
      });
    }
    
    await pool.query(
      "DELETE FROM usuarios WHERE id = ? AND role = 'veterinario'",
      [id]
    );
    
    res.json({ success: true, message: "Veterinario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar veterinario:", error);
    res.status(500).json({ message: "Error al eliminar veterinario" });
  }
});

/**
 * GESTIÓN DE ADMINISTRADORES
 */
app.get("/usuarios/administradores", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [admins] = await pool.query(
      "SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE role = 'admin'"
    );
    res.json(admins);
  } catch (error) {
    console.error("Error al obtener administradores:", error);
    res.status(500).json({ message: "Error al obtener administradores" });
  }
});

app.post("/usuarios/administradores", authenticateToken, isAdmin, async (req, res) => {
  const { nombre, apellido, email, telefono, direccion, password } = req.body;
  
  if (!nombre || !email || !password || !telefono) {
    return res.status(400).json({ message: "Nombre, email, teléfono y contraseña son requeridos" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      `INSERT INTO usuarios 
      (nombre, apellido, email, telefono, direccion, password, role) 
      VALUES (?, ?, ?, ?, ?, ?, 'admin')`,
      [nombre, apellido, email, telefono, direccion, hashedPassword]
    );
    
    const [newAdmin] = await pool.query(
      "SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE id = ?",
      [result.insertId]
    );
    
    res.status(201).json(newAdmin[0]);
  } catch (error) {
    console.error("Error al crear administrador:", error);
    res.status(500).json({ message: "Error al crear administrador" });
  }
});

app.put("/usuarios/administradores/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, telefono, direccion } = req.body;
  
  try {
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ 
        message: "Usa la sección de perfil para modificar tus propios datos" 
      });
    }
    
    await pool.query(
      "UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, direccion = ? WHERE id = ? AND role = 'admin'",
      [nombre, apellido, telefono, direccion, id]
    );
    
    const [updatedAdmin] = await pool.query(
      "SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE id = ?",
      [id]
    );
    
    res.json(updatedAdmin[0]);
  } catch (error) {
    console.error("Error al actualizar administrador:", error);
    res.status(500).json({ message: "Error al actualizar administrador" });
  }
});

app.delete("/usuarios/administradores/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ 
        message: "No puedes eliminarte a ti mismo" 
      });
    }
    
    await pool.query(
      "DELETE FROM usuarios WHERE id = ? AND role = 'admin'",
      [id]
    );
    
    res.json({ success: true, message: "Administrador eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar administrador:", error);
    res.status(500).json({ message: "Error al eliminar administrador" });
  }
});

/**
 * GESTIÓN DE USUARIOS REGULARES
 */
app.get("/admin/usuarios", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.direccion, u.active,
      COUNT(m.id_mascota) as mascotas 
      FROM usuarios u
      LEFT JOIN mascotas m ON u.id = m.id_propietario
      WHERE u.role = 'usuario'
      GROUP BY u.id`
    );
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

app.put("/admin/usuarios/:id/status", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  
  try {
    await pool.query(
      "UPDATE usuarios SET active = ? WHERE id = ? AND role = 'usuario'",
      [active ? 1 : 0, id]
    );
    
    res.json({ 
      success: true, 
      message: `Usuario ${active ? 'activado' : 'desactivado'} correctamente` 
    });
  } catch (error) {
    console.error("Error al cambiar estado de usuario:", error);
    res.status(500).json({ message: "Error al cambiar estado de usuario" });
  }
});

/**
 * VISUALIZACIÓN DE CITAS
 */
app.get("/admin/citas", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [appointments] = await pool.query(
      `SELECT c.id_cita, c.fecha, c.estado, c.ubicacion,
      s.nombre as servicio, s.precio,
      CONCAT(cl.nombre, ' ', cl.apellido) as cliente, cl.telefono as cliente_telefono,
      CONCAT(v.nombre, ' ', v.apellido) as veterinario
      FROM citas c
      JOIN servicios s ON c.id_servicio = s.id_servicio
      JOIN clientes cl ON c.id_cliente = cl.id_cliente
      LEFT JOIN usuarios v ON c.id_veterinario = v.id
      ORDER BY c.fecha DESC`
    );
    res.json(appointments);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
});

/**
 * VISUALIZACIÓN DE HISTORIALES MÉDICOS
 */
app.get("/admin/historiales", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT h.id_historial, h.fecha_consulta, h.diagnostico, h.tratamiento, h.observaciones,
      m.nombre as mascota, m.especie, m.raza,
      CONCAT(p.nombre, ' ', p.apellido) as propietario,
      CONCAT(v.nombre, ' ', v.apellido) as veterinario
      FROM historial_medico h
      JOIN mascotas m ON h.id_mascota = m.id_mascota
      JOIN clientes p ON m.id_propietario = p.id_cliente
      LEFT JOIN usuarios v ON h.veterinario = v.id
      ORDER BY h.fecha_consulta DESC`
    );
    res.json(records);
  } catch (error) {
    console.error("Error al obtener historiales médicos:", error);
    res.status(500).json({ message: "Error al obtener historiales médicos" });
  }
});

// Ruta para obtener citas de hoy
app.get("/api/citas/hoy", authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [citas] = await pool.query(
      `SELECT c.id_cita, c.id_cliente, cl.nombre as propietario, 
       m.nombre as mascota, m.especie as tipoMascota, 
       cl.direccion, s.nombre as servicio, c.fecha, c.estado
       FROM citas c
       JOIN clientes cl ON c.id_cliente = cl.id_cliente
       LEFT JOIN mascotas m ON c.id_cliente = m.id_propietario
       JOIN servicios s ON c.id_servicio = s.id_servicio
       WHERE DATE(c.fecha) = ? AND c.id_veterinario = ?`,
      [today, req.user.id]
    );

    res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas de hoy:", error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Limpiar tokens expirados cada hora
setInterval(async () => {
  try {
    await pool.query(
      "UPDATE usuarios SET reset_token = NULL, reset_token_expires = NULL WHERE reset_token_expires < NOW()"
    );
  } catch (err) {
    console.error('Error limpiando tokens expirados:', err);
  }
}, 3600000);
// Obtener citas por mes para el gráfico
app.get('/api/stats/citas-por-mes', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        MONTHNAME(fecha) as mes,
        COUNT(*) as cantidad
      FROM citas
      WHERE fecha >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY MONTH(fecha), mes
      ORDER BY MONTH(fecha) ASC
    `);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener citas por mes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener servicios más populares
app.get('/api/stats/servicios-populares', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        s.nombre as servicio,
        COUNT(c.id_servicio) as cantidad
      FROM citas c
      JOIN servicios s ON c.id_servicio = s.id_servicio
      WHERE c.fecha >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY c.id_servicio
      ORDER BY cantidad DESC
      LIMIT 5
    `);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener servicios populares:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});
