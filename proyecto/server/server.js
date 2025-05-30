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

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor de veterinaria funcionando correctamente");
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

  console.log('Datos recibidos:', { email, token });

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

// ================= RUTAS PROTEGIDAS =================

// Obtener estadísticas del dashboard
app.get("/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [[{citas}]] = await pool.query(
      `SELECT COUNT(*) as citas FROM citas 
      WHERE MONTH(fecha) = MONTH(CURRENT_DATE())`
    );
    
    const [[{veterinarios}]] = await pool.query(
      `SELECT COUNT(*) as veterinarios FROM usuarios 
      WHERE role = 'veterinario'`
    );
    
    const [[{admins}]] = await pool.query(
      `SELECT COUNT(*) as admins FROM usuarios 
      WHERE role = 'admin'`
    );
    
    const [[{mascotas}]] = await pool.query(
      `SELECT COUNT(*) as mascotas FROM mascotas`
    );
    
    const [[{citasMesPasado}]] = await pool.query(
      `SELECT COUNT(*) as citasMesPasado FROM citas 
      WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) - 1`
    );
    
    const growth = citasMesPasado > 0 
      ? ((citas - citasMesPasado) / citasMesPasado * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        appointments: citas,
        vets: veterinarios,
        admins: admins,
        pets: mascotas,
        monthlyGrowth: growth
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener estadísticas' 
    });
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
