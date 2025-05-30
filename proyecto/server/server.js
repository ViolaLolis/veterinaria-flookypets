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
  password: process.env.DB_PASSWORD || "",
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
 * Rutas actualizadas para coincidir con el frontend
 */

// Obtener todos los servicios (ruta actualizada)
app.get("/servicios", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [services] = await pool.query("SELECT * FROM servicios");
    res.json(services);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ message: "Error al obtener servicios" });
  }
});

// Crear un nuevo servicio (ruta actualizada)
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

// Actualizar un servicio existente (ruta actualizada)
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

// Eliminar un servicio (ruta actualizada)
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
 * Rutas actualizadas para coincidir con el frontend
 */

// Obtener todos los veterinarios (ruta actualizada)
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

// Crear un nuevo veterinario (ruta actualizada)
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

// Actualizar un veterinario existente (ruta actualizada)
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

// Eliminar un veterinario (ruta actualizada)
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
 * Rutas actualizadas para coincidir con el frontend
 */

// Obtener todos los administradores (ruta actualizada)
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

// Crear un nuevo administrador (ruta actualizada)
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

// Actualizar un administrador existente (ruta actualizada)
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

// Eliminar un administrador (ruta actualizada)
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
 * Solo lectura y cambio de estado (no se permite eliminar)
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
 * Solo lectura para el administrador
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
 * Solo lectura para el administrador
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