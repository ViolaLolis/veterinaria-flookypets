const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config(); // Carga las variables de entorno desde .env

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json()); // Habilita el parsing de JSON en el cuerpo de las peticiones

// Configuración del pool de conexiones a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "12345678",
    password: process.env.DB_PASSWORD || "", // Revertido al valor por defecto proporcionado previamente
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "veterinaria",
    waitForConnections: true,
    connectionLimit: 10, // Número máximo de conexiones en el pool
    queueLimit: 0 // Número máximo de solicitudes en cola
});

// Verificar conexión a la base de datos al inicio
pool.getConnection()
    .then(conn => {
        console.log('Conectado a la base de datos MySQL');
        conn.release(); // Libera la conexión de vuelta al pool
    })
    .catch(err => {
        console.error('Error de conexión a la base de datos:', err);
        process.exit(1); // Sale de la aplicación si no puede conectar a la DB
    });

// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del encabezado 'Bearer <token>'

    if (!token) return res.status(401).json({ success: false, message: "Acceso denegado. No se proporcionó token." });

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) {
            console.error("JWT Verification Error:", err);
            return res.status(403).json({ success: false, message: "Token inválido o expirado." });
        }
        req.user = user;
        next();
    });
};

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Acceso denegado. Se requiere rol de administrador." });
    }
    next();
};

// Middleware para verificar rol de veterinario o administrador
const isVetOrAdmin = (req, res, next) => {
    if (req.user.role !== 'veterinario' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Acceso denegado. Se requiere rol de veterinario o administrador." });
    }
    next();
};

// Middleware para verificar si es el propietario del recurso o un administrador
const isOwnerOrAdmin = async (req, res, next) => {
    const userIdFromToken = req.user.id;
    const userRole = req.user.role;

    // Admin siempre tiene acceso
    if (userRole === 'admin') {
        return next();
    }

    let resourceUserId = null; // ID del usuario asociado al recurso

    try {
        if (req.baseUrl.includes('/mascotas')) {
            const idMascota = parseInt(req.params.id || req.body.id_mascota);
            if (isNaN(idMascota)) {
                return res.status(400).json({ success: false, message: "ID de mascota no válido." });
            }
            const [rows] = await pool.query("SELECT id_propietario FROM mascotas WHERE id_mascota = ?", [idMascota]);
            if (rows.length > 0) resourceUserId = rows[0].id_propietario;
        } else if (req.baseUrl.includes('/historial_medico')) {
            const idHistorial = parseInt(req.params.id || req.body.id_historial);
            if (isNaN(idHistorial)) {
                return res.status(400).json({ success: false, message: "ID de historial médico no válido." });
            }
            const [rows] = await pool.query(
                "SELECT m.id_propietario FROM historial_medico h JOIN mascotas m ON h.id_mascota = m.id_mascota WHERE h.id_historial = ?",
                [idHistorial]
            );
            if (rows.length > 0) resourceUserId = rows[0].id_propietario;
        } else if (req.baseUrl.includes('/citas')) {
            const idCita = parseInt(req.params.id || req.body.id_cita);
            if (isNaN(idCita)) {
                return res.status(400).json({ success: false, message: "ID de cita no válido." });
            }
            const [rows] = await pool.query("SELECT id_cliente FROM citas WHERE id_cita = ?", [idCita]);
            if (rows.length > 0) resourceUserId = rows[0].id_cliente;
        } else if (req.baseUrl.includes('/usuarios')) {
            const userId = parseInt(req.params.id || req.body.id);
            if (isNaN(userId)) {
                return res.status(400).json({ success: false, message: "ID de usuario no válido." });
            }
            resourceUserId = userId; // Para /usuarios/:id, el propio usuario es el recurso
        }
        
        // Si no se pudo determinar el propietario del recurso o no hay recurso, denegar acceso.
        if (resourceUserId === null) {
            // Permitir que si es un POST a /mascotas o /historial_medico, el admin/vet pueda crear
            if (req.method === 'POST' && (req.baseUrl.includes('/mascotas') || req.baseUrl.includes('/historial_medico')) && userRole !== 'usuario') {
                 // Si es POST para crear, el middleware isVetOrAdmin ya manejará permisos
                return next();
            }
            return res.status(403).json({ success: false, message: "Acceso denegado. Recurso no encontrado o no eres el propietario." });
        }

        // Si el usuario del token es el propietario del recurso, permitir acceso
        if (resourceUserId === userIdFromToken) {
            return next();
        }

    } catch (error) {
        console.error("Error checking ownership:", error);
        return res.status(500).json({ success: false, message: "Error al verificar permisos." });
    }

    return res.status(403).json({ success: false, message: "Acceso denegado. No eres el propietario de este recurso." });
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
        const isMatch = await bcrypt.compare(password, user.password); // Compara la contraseña con el hash

        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Crear token JWT con el ID, email y rol del usuario
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key', // Clave secreta del JWT
            { expiresIn: '24h' } // El token expira en 24 horas
        );

        // Envía los datos del usuario y el token como respuesta
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
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// Ruta de registro para usuarios normales (rol 'usuario')
app.post("/register", async (req, res) => {
    const { nombre, apellido, email, password, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento } = req.body;

    // Validación básica de campos requeridos
    if (!email || !password || !nombre || !telefono) {
        return res.status(400).json({ message: "Datos incompletos" });
    }

    try {
        // Verificar si el usuario ya existe por email
        const [existingUsers] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "El email ya está registrado" });
        }

        // Hash de la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario con rol 'usuario' por defecto
        const [result] = await pool.query(
            `INSERT INTO usuarios
            (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'usuario')`,
            [email, hashedPassword, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento]
        );

        res.status(201).json({
            id: result.insertId, // ID del nuevo usuario insertado
            email,
            nombre,
            apellido,
            role: 'usuario'
        });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ message: "Error al registrar usuario", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Ruta para recuperación de contraseña (generación de token)
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

        // Generar un token de recuperación numérico de 6 dígitos
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpires = new Date(Date.now() + 3600000); // Token expira en 1 hora

        await pool.query(
            "UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
            [resetToken, resetTokenExpires, email]
        );

        // En desarrollo, se puede retornar el token para pruebas (NO HACER EN PRODUCCIÓN)
        res.json({
            success: true,
            message: "Token de recuperación generado",
            resetToken: resetToken // Solo para desarrollo, quitar en producción
        });

    } catch (error) {
        console.error("Error en forgot-password:", error);
        res.status(500).json({
            success: false,
            message: "Error en el servidor",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
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

        // Verifica que el token exista y coincida
        if (!user.reset_token || user.reset_token !== token) {
            return res.status(400).json({
                success: false,
                message: "Token inválido"
            });
        }

        // Verifica que el token no haya expirado
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
            message: "Error en el servidor",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
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
        // Busca al usuario con el email y token de recuperación válido y no expirado
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

        const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash de la nueva contraseña

        // Actualiza la contraseña y anula los campos de recuperación de token
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
            message: "Error en el servidor",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// =============================================
// RUTAS DEL PANEL DE ADMINISTRADOR
// =============================================

/**
 * OBTENER ESTADÍSTICAS PARA EL DASHBOARD DE ADMINISTRADOR
 * GET /admin/stats
 */
app.get("/admin/stats", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [[{ totalUsers }]] = await pool.query(
            "SELECT COUNT(*) as totalUsers FROM usuarios WHERE role = 'usuario'"
        );

        const [[{ totalVets }]] = await pool.query(
            "SELECT COUNT(*) as totalVets FROM usuarios WHERE role = 'veterinario'"
        );

        const [[{ totalAdmins }]] = await pool.query(
            "SELECT COUNT(*) as totalAdmins FROM usuarios WHERE role = 'admin'"
        );

        const [[{ totalServices }]] = await pool.query(
            "SELECT COUNT(*) as totalServices FROM servicios"
        );

        const [[{ totalAppointments }]] = await pool.query(
            "SELECT COUNT(*) as totalAppointments FROM citas WHERE MONTH(fecha) = MONTH(CURRENT_DATE())"
        );

        const [[{ lastMonthAppointments }]] = await pool.query(
            "SELECT COUNT(*) as lastMonthAppointments FROM citas WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) - 1"
        );

        const growth = lastMonthAppointments > 0
            ? ((totalAppointments - lastMonthAppointments) / lastMonthAppointments * 100).toFixed(2)
            : 100;

        res.json({
            success: true,
            data: {
                totalUsers,
                totalVets,
                totalAdmins,
                totalServices,
                totalAppointments,
                monthlyGrowth: parseFloat(growth)
            }
        });
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ success: false, message: "Error al obtener estadísticas", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

/**
 * NUEVO ENDPOINT: OBTENER CITAS POR MES PARA GRÁFICOS
 * GET /api/stats/citas-por-mes
 */
app.get("/api/stats/citas-por-mes", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [citasPorMes] = await pool.query(
            `SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, COUNT(*) as cantidad
             FROM citas
             GROUP BY mes
             ORDER BY mes ASC
             LIMIT 12` // Limitar a los últimos 12 meses, por ejemplo
        );
        res.json({ success: true, data: citasPorMes });
    } catch (error) {
        console.error("Error al obtener citas por mes:", error);
        res.status(500).json({ success: false, message: "Error al obtener citas por mes", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

/**
 * NUEVO ENDPOINT: OBTENER SERVICIOS POPULARES PARA GRÁFICOS
 * GET /api/stats/servicios-populares
 */
app.get("/api/stats/servicios-populares", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [serviciosPopulares] = await pool.query(
            `SELECT s.nombre as servicio, COUNT(c.id_cita) as cantidad
             FROM servicios s
             JOIN citas c ON s.id_servicio = c.id_servicio
             GROUP BY s.nombre
             ORDER BY cantidad DESC
             LIMIT 5` // Top 5 servicios más populares
        );
        res.json({ success: true, data: serviciosPopulares });
    } catch (error) {
        console.error("Error al obtener servicios populares:", error);
        res.status(500).json({ success: false, message: "Error al obtener servicios populares", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// ### **GESTIÓN DE ADMINISTRADORES**

// Obtener todos los administradores
app.get("/api/admin/administrators", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [admins] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, active,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
            FROM usuarios WHERE role = 'admin'`
        );
        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error("Error al obtener administradores:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener administradores",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// Crear nuevo administrador
app.post("/api/admin/administrators", authenticateToken, isAdmin, async (req, res) => {
    const { nombre, apellido, email, telefono, direccion, password } = req.body;

    // Validación mejorada
    if (!nombre || !email || !password || !telefono) {
        return res.status(400).json({
            success: false,
            message: "Nombre, email, teléfono y contraseña son requeridos"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "La contraseña debe tener al menos 6 caracteres"
        });
    }

    try {
        // Verificar si el email ya existe
        const [existing] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "El email ya está registrado"
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo administrador
        const [result] = await pool.query(
            `INSERT INTO usuarios
            (nombre, apellido, email, telefono, direccion, password, role)
            VALUES (?, ?, ?, ?, ?, ?, 'admin')`,
            [nombre, apellido, email, telefono, direccion, hashedPassword]
        );

        // Obtener el administrador recién creado para devolverlo en la respuesta
        const [newAdmin] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, active,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
            FROM usuarios WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Administrador creado correctamente",
            data: newAdmin[0]
        });

    } catch (error) {
        console.error("Error al crear administrador:", error);
        res.status(500).json({
            success: false,
            message: "Error al crear administrador",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// Actualizar administrador
app.put("/api/admin/administrators/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion } = req.body;

    // Validación básica
    if (!nombre || !telefono) {
        return res.status(400).json({
            success: false,
            message: "Nombre y teléfono son requeridos"
        });
    }

    try {
        // Un administrador no debería poder modificarse a sí mismo desde este panel (usa su perfil)
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Usa la sección de perfil para modificar tus propios datos"
            });
        }

        // Verificar que el administrador existe y tiene el rol correcto
        const [existing] = await pool.query(
            "SELECT id FROM usuarios WHERE id = ? AND role = 'admin'",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Administrador no encontrado"
            });
        }

        // Actualizar datos del administrador
        await pool.query(
            `UPDATE usuarios
            SET nombre = ?, apellido = ?, telefono = ?, direccion = ?
            WHERE id = ? AND role = 'admin'`,
            [nombre, apellido, telefono, direccion, id]
        );

        // Obtener el administrador actualizado para devolverlo en la respuesta
        const [updatedAdmin] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, active,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
            FROM usuarios WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "Administrador actualizado correctamente",
            data: updatedAdmin[0]
        });
    } catch (error) {
        console.error("Error al actualizar administrador:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar administrador",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// Eliminar administrador
app.delete("/api/admin/administrators/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        // Evitar que un administrador se elimine a sí mismo
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({
                success: false,
                message: "No puedes eliminarte a ti mismo"
            });
        }

        // Verificar si el administrador tiene citas asignadas
        const [appointments] = await pool.query(
            "SELECT id_cita FROM citas WHERE id_veterinario = ?",
            [id]
        );

        if (appointments.length > 0) {
            return res.status(400).json({
                success: false,
                message: "No se puede eliminar porque tiene citas asignadas"
            });
        }

        // Verificar si el administrador tiene historiales médicos asociados
        const [records] = await pool.query(
            "SELECT id_historial FROM historial_medico WHERE veterinario = ?",
            [id]
        );

        if (records.length > 0) {
            return res.status(400).json({
                success: false,
                message: "No se puede eliminar porque tiene historiales médicos asociados"
            });
        }

        // Eliminar el administrador
        const [result] = await pool.query(
            "DELETE FROM usuarios WHERE id = ? AND role = 'admin'",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Administrador no encontrado"
            });
        }

        res.json({
            success: true,
            message: "Administrador eliminado correctamente"
        });
    } catch (error) {
        console.error("Error al eliminar administrador:", error);

        // Captura errores de restricción de clave foránea si la comprobación previa falla
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                success: false,
                message: "No se puede eliminar porque tiene registros asociados (clave foránea)"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error al eliminar administrador",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});


// ### **GESTIÓN DE VETERINARIOS**

// Obtener todos los veterinarios
app.get("/usuarios/veterinarios", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [vets] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion, active, created_at FROM usuarios WHERE role = 'veterinario'"
        );
        res.json({ success: true, data: vets }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al obtener veterinarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener veterinarios", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Crear nuevo veterinario
app.post("/usuarios/veterinarios", authenticateToken, isAdmin, async (req, res) => {
    const { nombre, apellido, email, telefono, direccion, password } = req.body;

    // Validación de campos requeridos
    if (!nombre || !email || !password || !telefono) {
        return res.status(400).json({ success: false, message: "Nombre, email, teléfono y contraseña son requeridos" });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 6 caracteres" });
    }

    try {
        // Verificar si el email ya existe
        const [existing] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "El email ya está registrado" });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo veterinario con rol 'veterinario'
        const [result] = await pool.query(
            `INSERT INTO usuarios
            (nombre, apellido, email, telefono, direccion, password, role)
            VALUES (?, ?, ?, ?, ?, ?, 'veterinario')`,
            [nombre, apellido, email, telefono, direccion, hashedPassword]
        );

        // Obtener el veterinario recién creado para devolverlo en la respuesta
        const [newVet] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion, active, created_at FROM usuarios WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({ success: true, message: "Veterinario creado correctamente", data: newVet[0] }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al crear veterinario:", error);
        res.status(500).json({ success: false, message: "Error al crear veterinario", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar veterinario
app.put("/usuarios/veterinarios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion, active } = req.body; // Se incluye 'active' para permitir actualizar el estado

    // Validación básica
    if (!nombre || !telefono) {
        return res.status(400).json({ success: false, message: "Nombre y teléfono son requeridos" });
    }

    try {
        // Verificar que el veterinario existe y tiene el rol correcto
        const [existing] = await pool.query(
            "SELECT id FROM usuarios WHERE id = ? AND role = 'veterinario'",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "Veterinario no encontrado" });
        }

        // Construir la consulta de actualización dinámicamente
        const fields = [];
        const values = [];
        if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
        if (apellido !== undefined) { fields.push('apellido = ?'); values.push(apellido); }
        if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono); }
        if (direccion !== undefined) { fields.push('direccion = ?'); values.push(direccion); }
        if (active !== undefined) { fields.push('active = ?'); values.push(active ? 1 : 0); } // Actualizar estado

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "No hay datos para actualizar." });
        }

        const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ? AND role = 'veterinario'`;
        values.push(id);

        await pool.query(query, values);

        // Obtener el veterinario actualizado para devolverlo en la respuesta
        const [updatedVet] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion, active, created_at FROM usuarios WHERE id = ?",
            [id]
        );

        res.json({ success: true, message: "Veterinario actualizado correctamente", data: updatedVet[0] }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al actualizar veterinario:", error);
        res.status(500).json({ success: false, message: "Error al actualizar veterinario", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar veterinario
app.delete("/usuarios/veterinarios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si el veterinario tiene citas asignadas
        const [appointments] = await pool.query(
            "SELECT id_cita FROM citas WHERE id_veterinario = ?",
            [id]
        );

        if (appointments.length > 0) {
            return res.status(400).json({
                success: false,
                message: "No se puede eliminar el veterinario porque tiene citas asignadas"
            });
        }

        // Verificar si el veterinario tiene historiales médicos asociados
        const [records] = await pool.query(
            "SELECT id_historial FROM historial_medico WHERE veterinario = ?",
            [id]
        );

        if (records.length > 0) {
            return res.status(400).json({
                success: false,
                message: "No se puede eliminar el veterinario porque tiene historiales médicos asociados"
            });
        }

        // Eliminar el veterinario
        const [result] = await pool.query(
            "DELETE FROM usuarios WHERE id = ? AND role = 'veterinario'",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Veterinario no encontrado" });
        }

        res.json({ success: true, message: "Veterinario eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar veterinario:", error);

        // Captura errores de restricción de clave foránea si la comprobación previa falla
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                success: false,
                message: "No se puede eliminar el veterinario porque tiene registros asociados"
            });
        }

        res.status(500).json({ success: false, message: "Error al eliminar veterinario", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// ### **GESTIÓN DE SERVICIOS**

// Obtener todos los servicios
app.get("/servicios", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [services] = await pool.query("SELECT * FROM servicios");
        res.json({ success: true, data: services }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al obtener servicios:", error);
        res.status(500).json({ success: false, message: "Error al obtener servicios", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Crear nuevo servicio
app.post("/servicios", authenticateToken, isAdmin, async (req, res) => {
    const { nombre, descripcion, precio } = req.body;

    if (!nombre || !descripcion || !precio) {
        return res.status(400).json({ success: false, message: "Todos los campos son requeridos" });
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

        res.status(201).json({ success: true, message: "Servicio creado correctamente", data: newService[0] }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al crear servicio:", error);
        res.status(500).json({ success: false, message: "Error al crear servicio", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar servicio
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

        res.json({ success: true, message: "Servicio actualizado correctamente", data: updatedService[0] }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al actualizar servicio:", error);
        res.status(500).json({ success: false, message: "Error al actualizar servicio", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar servicio
app.delete("/servicios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM servicios WHERE id_servicio = ?", [id]);
        res.json({ success: true, message: "Servicio eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar servicio:", error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                success: false,
                message: "No se puede eliminar el servicio porque está asociado a citas existentes"
            });
        }

        res.status(500).json({ success: false, message: "Error al eliminar servicio", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// =============================================
// RUTAS DE GESTIÓN DE USUARIOS (REGULARES/CLIENTES)
// =============================================

// Obtener todos los usuarios con role 'usuario' (para la tabla de AdminUsers)
app.get("/admin/usuarios", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.direccion, u.active,
             COUNT(m.id_mascota) as num_mascotas, u.created_at, u.tipo_documento, u.numero_documento, u.fecha_nacimiento
             FROM usuarios u
             LEFT JOIN mascotas m ON u.id = m.id_propietario
             WHERE u.role = 'usuario'
             GROUP BY u.id
             ORDER BY u.created_at DESC`
        );
        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Error al obtener usuarios (clientes):", error);
        res.status(500).json({ success: false, message: "Error al obtener usuarios", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Obtener detalles de un usuario por ID (para AdminUserDetail.js y otros)
app.get("/usuarios/:id", authenticateToken, async (req, res) => { 
    const { id } = req.params;
    try {
        // Permite a un usuario ver su propio perfil o a un admin ver cualquier perfil
        if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para ver este perfil." });
        }

        const [user] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento,
                    fecha_nacimiento, role, active, created_at
             FROM usuarios
             WHERE id = ?`,
            [id]
        );
        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }
        res.json({ success: true, data: user[0] });
    } catch (error) {
        console.error(`Error al obtener usuario ${id}:`, error);
        res.status(500).json({ success: false, message: "Error al obtener datos del usuario.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar usuario (general, para clientes, veterinarios, admins)
app.put("/usuarios/:id", authenticateToken, async (req, res) => { 
    const { id } = req.params;
    const { nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, active, password } = req.body;

    // Asegurarse de que el usuario solo pueda actualizar su propio perfil o que sea un admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para actualizar este perfil." });
    }

    try {
        const fields = [];
        const values = [];

        if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
        if (apellido !== undefined) { fields.push('apellido = ?'); values.push(apellido); }
        
        if (email !== undefined) {
            const [existing] = await pool.query(
                "SELECT id FROM usuarios WHERE email = ? AND id != ?",
                [email, id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: "El email ya está en uso por otro usuario." });
            }
            fields.push('email = ?'); values.push(email);
        }
        
        if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono); }
        if (direccion !== undefined) { fields.push('direccion = ?'); values.push(direccion); }
        if (tipo_documento !== undefined) { fields.push('tipo_documento = ?'); values.push(tipo_documento); }
        if (numero_documento !== undefined) { fields.push('numero_documento = ?'); values.push(numero_documento); }
        if (fecha_nacimiento !== undefined) { fields.push('fecha_nacimiento = ?'); values.push(fecha_nacimiento); }
        
        // Solo un admin puede cambiar el estado 'active'
        if (active !== undefined && req.user.role === 'admin') {
            fields.push('active = ?'); values.push(active ? 1 : 0);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push('password = ?'); values.push(hashedPassword);
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "No hay datos para actualizar." });
        }

        const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado o no autorizado para actualizar." });
        }

        const [updatedUser] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento,
                    fecha_nacimiento, role, active, created_at
             FROM usuarios WHERE id = ?`,
            [id]
        );

        res.json({ success: true, message: "Usuario actualizado correctamente.", data: updatedUser[0] });

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ success: false, message: "Error al actualizar usuario.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// Eliminar usuario y datos relacionados
app.delete("/usuarios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar registros de historial médico asociados a las mascotas del usuario
        const [mascotas] = await pool.query("SELECT id_mascota FROM mascotas WHERE id_propietario = ?", [id]);
        if (mascotas.length > 0) {
            const mascotaIds = mascotas.map(m => m.id_mascota);
            await pool.query("DELETE FROM historial_medico WHERE id_mascota IN (?)", [mascotaIds]);
        }
        
        // Eliminar citas asociadas al usuario (si hay, basado en id_cliente)
        await pool.query("DELETE FROM citas WHERE id_cliente = ?", [id]);

        // Eliminar mascotas del usuario
        await pool.query("DELETE FROM mascotas WHERE id_propietario = ?", [id]);

        // Finalmente, eliminar el usuario
        const [result] = await pool.query("DELETE FROM usuarios WHERE id = ? AND role = 'usuario'", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        res.json({ success: true, message: "Usuario y sus datos asociados eliminados correctamente." });

    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ success: false, message: "Error al eliminar usuario.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// =============================================
// RUTAS DE GESTIÓN DE MASCOTAS
// =============================================

// Obtener todas las mascotas
// Modificado para aceptar un query parameter id_propietario
app.get("/mascotas", authenticateToken, isVetOrAdmin, async (req, res) => {
    try {
        const { id_propietario } = req.query; // Leer id_propietario desde los query parameters
        let query = `SELECT m.*, CONCAT(u.nombre, ' ', u.apellido) as propietario_nombre
                     FROM mascotas m
                     JOIN usuarios u ON m.id_propietario = u.id`;
        const queryParams = [];

        if (id_propietario) {
            query += ` WHERE m.id_propietario = ?`;
            queryParams.push(id_propietario);
        }

        query += ` ORDER BY m.nombre ASC`;

        const [mascotas] = await pool.query(query, queryParams);
        res.json({ success: true, data: mascotas });
    } catch (error) {
        console.error("Error al obtener mascotas:", error);
        res.status(500).json({ success: false, message: "Error al obtener mascotas", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Obtener una mascota por ID
app.get("/mascotas/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [mascota] = await pool.query(
            `SELECT m.*, CONCAT(u.nombre, ' ', u.apellido) as propietario_nombre
             FROM mascotas m
             JOIN usuarios u ON m.id_propietario = u.id
             WHERE m.id_mascota = ?`,
            [id]
        );
        if (mascota.length === 0) {
            return res.status(404).json({ success: false, message: "Mascota no encontrada." });
        }
        res.json({ success: true, data: mascota[0] });
    } catch (error) {
        console.error(`Error al obtener mascota ${id}:`, error);
        res.status(500).json({ success: false, message: "Error al obtener mascota.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Registrar nueva mascota
app.post("/mascotas", authenticateToken, isVetOrAdmin, async (req, res) => {
    const { nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario } = req.body;

    if (!nombre || !especie || !id_propietario) {
        return res.status(400).json({ success: false, message: "Nombre, especie y ID de propietario son requeridos." });
    }

    try {
        // Verificar que el propietario exista y sea un usuario regular
        const [owner] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'usuario'", [id_propietario]);
        if (owner.length === 0) {
            return res.status(400).json({ success: false, message: "El ID de propietario no es válido o no corresponde a un usuario regular." });
        }

        const [result] = await pool.query(
            `INSERT INTO mascotas (nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario]
        );

        const [newMascota] = await pool.query("SELECT * FROM mascotas WHERE id_mascota = ?", [result.insertId]);

        res.status(201).json({ success: true, message: "Mascota registrada correctamente.", data: newMascota[0] });
    } catch (error) {
        console.error("Error al registrar mascota:", error);
        res.status(500).json({ success: false, message: "Error al registrar mascota.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar mascota
app.put("/mascotas/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario } = req.body;

    try {
        if (id_propietario !== undefined) {
            const [owner] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'usuario'", [id_propietario]);
            if (owner.length === 0) {
                return res.status(400).json({ success: false, message: "El nuevo ID de propietario no es válido o no corresponde a un usuario regular." });
            }
        }

        const fields = [];
        const values = [];
        if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
        if (especie !== undefined) { fields.push('especie = ?'); values.push(especie); }
        if (raza !== undefined) { fields.push('raza = ?'); values.push(raza); }
        if (edad !== undefined) { fields.push('edad = ?'); values.push(edad); }
        if (peso !== undefined) { fields.push('peso = ?'); values.push(peso); }
        if (sexo !== undefined) { fields.push('sexo = ?'); values.push(sexo); }
        if (color !== undefined) { fields.push('color = ?'); values.push(color); }
        if (microchip !== undefined) { fields.push('microchip = ?'); values.push(microchip); }
        if (id_propietario !== undefined) { fields.push('id_propietario = ?'); values.push(id_propietario); }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "No hay datos para actualizar." });
        }

        const query = `UPDATE mascotas SET ${fields.join(', ')} WHERE id_mascota = ?`;
        values.push(id);

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Mascota no encontrada o sin cambios." });
        }

        const [updatedMascota] = await pool.query("SELECT * FROM mascotas WHERE id_mascota = ?", [id]);
        res.json({ success: true, message: "Mascota actualizada correctamente.", data: updatedMascota[0] });

    } catch (error) {
        console.error("Error al actualizar mascota:", error);
        res.status(500).json({ success: false, message: "Error al actualizar mascota.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar mascota
app.delete("/mascotas/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM historial_medico WHERE id_mascota = ?", [id]);
        // Si citas no tiene id_mascota, esta línea se elimina
        // await pool.query("DELETE FROM citas WHERE id_mascota = ?", [id]); 

        const [result] = await pool.query("DELETE FROM mascotas WHERE id_mascota = ?", [id]); // Eliminado id_propietario del WHERE

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Mascota no encontrada." });
        }
        res.json({ success: true, message: "Mascota y sus historiales/citas asociados eliminados correctamente." });
    } catch (error) {
        console.error("Error al eliminar mascota:", error);
        res.status(500).json({ success: false, message: "Error al eliminar mascota.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// =============================================
// RUTAS DE GESTIÓN DE HISTORIAL MÉDICO
// =============================================

// Obtener todos los historiales médicos (solo para admins y veterinarios)
app.get("/historial_medico", authenticateToken, isVetOrAdmin, async (req, res) => {
    try {
        const [historiales] = await pool.query(
            `SELECT h.*, m.nombre as mascota_nombre, m.especie, m.raza,
                    CONCAT(u_prop.nombre, ' ', u_prop.apellido) as propietario_nombre,
                    CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre
             FROM historial_medico h
             JOIN mascotas m ON h.id_mascota = m.id_mascota
             JOIN usuarios u_prop ON m.id_propietario = u_prop.id
             LEFT JOIN usuarios u_vet ON h.veterinario = u_vet.id
             ORDER BY h.fecha_consulta DESC`
        );
        res.json({ success: true, data: historiales });
    } catch (error) {
        console.error("Error al obtener historiales médicos:", error);
        res.status(500).json({ success: false, message: "Error al obtener historiales médicos", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Obtener un historial médico por ID (propietario o admin/vet)
app.get("/historial_medico/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [historial] = await pool.query(
            `SELECT h.*, m.nombre as mascota_nombre, m.especie, m.raza,
                    CONCAT(u_prop.nombre, ' ', u_prop.apellido) as propietario_nombre,
                    CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre
             FROM historial_medico h
             JOIN mascotas m ON h.id_mascota = m.id_mascota
             JOIN usuarios u_prop ON m.id_propietario = u_prop.id
             LEFT JOIN usuarios u_vet ON h.veterinario = u_vet.id
             WHERE h.id_historial = ?`,
            [id]
        );
        if (historial.length === 0) {
            return res.status(404).json({ success: false, message: "Historial médico no encontrado." });
        }
        res.json({ success: true, data: historial[0] });
    } catch (error) {
        console.error(`Error al obtener historial médico ${id}:`, error);
        res.status(500).json({ success: false, message: "Error al obtener historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Registrar nuevo historial médico (solo para veterinarios o admins)
app.post("/historial_medico", authenticateToken, isVetOrAdmin, async (req, res) => {
    const { id_mascota, fecha_consulta, diagnostico, tratamiento, observaciones, veterinario } = req.body;

    if (!id_mascota || !fecha_consulta || !diagnostico || !tratamiento || !veterinario) {
        return res.status(400).json({ success: false, message: "Campos requeridos incompletos para el historial médico." });
    }

    try {
        // Verificar que la mascota exista
        const [mascota] = await pool.query("SELECT id_mascota FROM mascotas WHERE id_mascota = ?", [id_mascota]);
        if (mascota.length === 0) {
            return res.status(400).json({ success: false, message: "ID de mascota no válido." });
        }

        // Verificar que el veterinario exista y tenga el rol correcto
        const [vetUser] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role IN ('veterinario', 'admin')", [veterinario]);
        if (vetUser.length === 0) {
            return res.status(400).json({ success: false, message: "ID de veterinario no válido o no autorizado." });
        }

        const [result] = await pool.query(
            `INSERT INTO historial_medico (id_mascota, fecha_consulta, diagnostico, tratamiento, observaciones, veterinario)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id_mascota, fecha_consulta, diagnostico, tratamiento, observaciones, veterinario]
        );

        const [newRecord] = await pool.query("SELECT * FROM historial_medico WHERE id_historial = ?", [result.insertId]);

        res.status(201).json({ success: true, message: "Historial médico registrado correctamente.", data: newRecord[0] });
    } catch (error) {
        console.error("Error al registrar historial médico:", error);
        res.status(500).json({ success: false, message: "Error al registrar historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar historial médico (solo para veterinarios o admins)
app.put("/historial_medico/:id", authenticateToken, isVetOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { fecha_consulta, diagnostico, tratamiento, observaciones, veterinario } = req.body;

    try {
        // Verificar que el historial exista
        const [existing] = await pool.query("SELECT id_historial FROM historial_medico WHERE id_historial = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "Historial médico no encontrado." });
        }

        // Verificar que el veterinario (si se cambia) sea válido
        if (veterinario !== undefined) {
            const [vetUser] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role IN ('veterinario', 'admin')", [veterinario]);
            if (vetUser.length === 0) {
                return res.status(400).json({ success: false, message: "ID de veterinario no válido o no autorizado." });
            }
        }

        const fields = [];
        const values = [];
        if (fecha_consulta !== undefined) { fields.push('fecha_consulta = ?'); values.push(fecha_consulta); }
        if (diagnostico !== undefined) { fields.push('diagnostico = ?'); values.push(diagnostico); }
        if (tratamiento !== undefined) { fields.push('tratamiento = ?'); values.push(tratamiento); }
        if (observaciones !== undefined) { fields.push('observaciones = ?'); values.push(observaciones); }
        if (veterinario !== undefined) { fields.push('veterinario = ?'); values.push(veterinario); }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "No hay datos para actualizar." });
        }

        const query = `UPDATE historial_medico SET ${fields.join(', ')} WHERE id_historial = ?`;
        values.push(id);

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Historial médico no encontrado o sin cambios." });
        }

        const [updatedRecord] = await pool.query("SELECT * FROM historial_medico WHERE id_historial = ?", [id]);
        res.json({ success: true, message: "Historial médico actualizado correctamente.", data: updatedRecord[0] });

    } catch (error) {
        console.error("Error al actualizar historial médico:", error);
        res.status(500).json({ success: false, message: "Error al actualizar historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar historial médico (solo para admins)
app.delete("/historial_medico/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("DELETE FROM historial_medico WHERE id_historial = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Historial médico no encontrado." });
        }
        res.json({ success: true, message: "Historial médico eliminado correctamente." });
    } catch (error) {
        console.error("Error al eliminar historial médico:", error);
        res.status(500).json({ success: false, message: "Error al eliminar historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// =============================================
// RUTAS DE GESTIÓN DE CITAS
// =============================================

// Obtener todas las citas
app.get("/citas", authenticateToken, async (req, res) => {
    try {
        let query = `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d %H:%i') as fecha, c.estado, c.servicios,
                            s.nombre as servicio_nombre, s.precio,
                            CONCAT(u_cli.nombre, ' ', u_cli.apellido) as cliente_nombre, u_cli.telefono as cliente_telefono,
                            CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre,
                            s.id_servicio, u_cli.id as id_cliente, u_vet.id as id_veterinario
                     FROM citas c
                     JOIN servicios s ON c.id_servicio = s.id_servicio
                     JOIN usuarios u_cli ON c.id_cliente = u_cli.id
                     LEFT JOIN usuarios u_vet ON c.id_veterinario = u_vet.id
                     `; 
        const queryParams = [];

        // Filtro por rol: Administrador ve todas, Veterinario solo las suyas, Usuario solo las suyas.
        if (req.user.role === 'veterinario') {
            query += ` WHERE c.id_veterinario = ?`;
            queryParams.push(req.user.id);
        } else if (req.user.role === 'usuario') {
            query += ` WHERE c.id_cliente = ?`;
            queryParams.push(req.user.id);
        }

        query += ` ORDER BY c.fecha DESC`;

        const [citas] = await pool.query(query, queryParams);
        res.json({ success: true, data: citas });
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).json({ success: false, message: "Error al obtener citas", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Obtener una cita por ID (propietario o admin/vet)
app.get("/citas/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [cita] = await pool.query(
            `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d %H:%i') as fecha, c.estado, c.servicios,
                    s.nombre as servicio_nombre, s.precio, s.id_servicio,
                    u_cli.id as id_cliente, CONCAT(u_cli.nombre, ' ', u_cli.apellido) as cliente_nombre, u_cli.telefono as cliente_telefono,
                    u_vet.id as id_veterinario, CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre
             FROM citas c
             JOIN servicios s ON c.id_servicio = s.id_servicio
             JOIN usuarios u_cli ON c.id_cliente = u_cli.id
             LEFT JOIN usuarios u_vet ON c.id_veterinario = u_vet.id
             WHERE c.id_cita = ?`,
            [id]
        ); 
        if (cita.length === 0) {
            return res.status(404).json({ success: false, message: "Cita no encontrada." });
        }
        res.json({ success: true, data: cita[0] });
    } catch (error) {
        console.error(`Error al obtener cita ${id}:`, error);
        res.status(500).json({ success: false, message: "Error al obtener cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Registrar nueva cita (solo para usuarios o admins/vets que registran para un cliente)
app.post("/citas", authenticateToken, async (req, res) => {
    const { fecha, estado, servicios, id_servicio, id_cliente, id_veterinario } = req.body; 

    // Validación básica de campos requeridos
    if (!fecha || !id_servicio || !id_cliente) {
        return res.status(400).json({ success: false, message: "Fecha, servicio y cliente son requeridos para la cita." });
    }

    // Si el usuario es 'usuario', asegurarse de que solo pueda crear citas para sí mismo
    if (req.user.role === 'usuario' && req.user.id !== id_cliente) {
        return res.status(403).json({ success: false, message: "Acceso denegado. No puedes crear citas para otros usuarios." });
    }

    try {
        // Verificar que el servicio exista
        const [service] = await pool.query("SELECT id_servicio FROM servicios WHERE id_servicio = ?", [id_servicio]);
        if (service.length === 0) {
            return res.status(400).json({ success: false, message: "ID de servicio no válido." });
        }

        // Verificar que el cliente exista y sea un usuario
        const [cliente] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'usuario'", [id_cliente]);
        if (cliente.length === 0) {
            return res.status(400).json({ success: false, message: "ID de cliente no válido o no es un usuario." });
        }

        // Verificar que el veterinario (si se proporciona) exista y tenga el rol correcto
        if (id_veterinario) {
            const [vet] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'veterinario'", [id_veterinario]);
            if (vet.length === 0) {
                return res.status(400).json({ success: false, message: "ID de veterinario no válido o no es un veterinario." });
            }
        }
        
        const [result] = await pool.query(
            `INSERT INTO citas (fecha, estado, servicios, id_servicio, id_cliente, id_veterinario)
             VALUES (?, ?, ?, ?, ?, ?)`, 
            [fecha, estado || 'pendiente', servicios || null, id_servicio, id_cliente, id_veterinario || null]
        );

        const [newCita] = await pool.query("SELECT * FROM citas WHERE id_cita = ?", [result.insertId]);

        res.status(201).json({ success: true, message: "Cita registrada correctamente.", data: newCita[0] });
    } catch (error) {
        console.error("Error al registrar cita:", error);
        res.status(500).json({ success: false, message: "Error al registrar cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar cita (admin/vet/owner for cancel)
app.put("/citas/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    let { fecha, estado, servicios, id_servicio, id_cliente, id_veterinario } = req.body; // Cambiado 'ubicacion' a 'servicios'

    try {
        // --- Lógica de autorización personalizada para esta ruta específica ---
        const userIdFromToken = req.user.id;
        const userRole = req.user.role;

        const [citaResult] = await pool.query("SELECT id_cliente, id_veterinario FROM citas WHERE id_cita = ?", [id]);
        if (citaResult.length === 0) {
            return res.status(404).json({ success: false, message: "Cita no encontrada." });
        }
        const existingCita = citaResult[0];

        let isAuthorized = false;

        // Administrador siempre puede modificar
        if (userRole === 'admin') {
            isAuthorized = true;
        } else {
            // Usuario (cliente): solo puede cancelar sus propias citas
            if (userRole === 'usuario' && estado === 'cancelada' && userIdFromToken === existingCita.id_cliente) {
                isAuthorized = true;
            }
            // Veterinario: puede completar o cancelar citas que le estén asignadas
            // Y también puede actualizar otros detalles de las citas que le estén asignadas
            else if (userRole === 'veterinario' && userIdFromToken === existingCita.id_veterinario) {
                isAuthorized = true;
            }
            // Si ninguna de las condiciones anteriores se cumple, denegar acceso.
            else {
                return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para realizar esta acción o solo puedes cancelar/completar tu cita/cita asignada." });
            }
        }
        
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para realizar esta acción." });
        }
        // --- Fin de la lógica de autorización personalizada ---

        const fields = [];
        const values = [];

        if (fecha !== undefined) { fields.push('fecha = ?'); values.push(fecha); }
        
        if (estado !== undefined) {
            fields.push('estado = ?'); values.push(estado);
        }

        if (servicios !== undefined) { fields.push('servicios = ?'); values.push(servicios); } // Usar 'servicios'

        if (id_servicio !== undefined) {
            const [service] = await pool.query("SELECT id_servicio FROM servicios WHERE id_servicio = ?", [id_servicio]);
            if (service.length === 0) return res.status(400).json({ success: false, message: "ID de servicio no válido." });
            fields.push('id_servicio = ?'); values.push(id_servicio);
        }
        
        if (id_cliente !== undefined && userRole === 'admin') { 
            const [cliente] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'usuario'", [id_cliente]);
            if (cliente.length === 0) return res.status(400).json({ success: false, message: "ID de cliente no válido o no es un usuario." });
            fields.push('id_cliente = ?'); values.push(id_cliente);
        }

        if (id_veterinario !== undefined) {
            const [vet] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'veterinario'", [id_veterinario]);
            if (vet.length === 0) return res.status(400).json({ success: false, message: "ID de veterinario no válido o no es un veterinario." });
            fields.push('id_veterinario = ?'); values.push(id_veterinario);
        } else if (req.body.hasOwnProperty('id_veterinario') && id_veterinario === null) {
            fields.push('id_veterinario = ?'); values.push(null);
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "No hay datos para actualizar." });
        }

        const query = `UPDATE citas SET ${fields.join(', ')} WHERE id_cita = ?`;
        values.push(id);

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Cita no encontrada o sin cambios." });
        }

        const [updatedCita] = await pool.query("SELECT * FROM citas WHERE id_cita = ?", [id]);
        res.json({ success: true, message: "Cita actualizada correctamente.", data: updatedCita[0] });

    } catch (error) {
        console.error("Error al actualizar cita:", error);
        res.status(500).json({ success: false, message: "Error al actualizar cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar cita (admin)
app.delete("/citas/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("DELETE FROM citas WHERE id_cita = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Cita no encontrada." });
        }
        res.json({ success: true, message: "Cita eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar cita:", error);
        res.status(500).json({ success: false, message: "Error al eliminar cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// =============================================
// RUTAS YA EXISTENTES Y AJUSTADAS PARA COHERENCIA
// =============================================

// ### **VISUALIZACIÓN DE CITAS** (Endpoint para Admin)
app.get("/admin/citas", authenticateToken, isAdmin, async (req, res) => {
    try {
        let query = `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d %H:%i') as fecha, c.estado, c.servicios,
            s.nombre as servicio, s.precio,
            CONCAT(cl.nombre, ' ', cl.apellido) as cliente, cl.telefono as cliente_telefono,
            CONCAT(v.nombre, ' ', v.apellido) as veterinario,
            s.id_servicio, cl.id as id_cliente, v.id as id_veterinario
            FROM citas c
            JOIN servicios s ON c.id_servicio = s.id_servicio
            JOIN usuarios cl ON c.id_cliente = cl.id
            LEFT JOIN usuarios v ON c.id_veterinario = v.id`;

        const queryParams = [];
        const { status } = req.query; // Obtener el parámetro de estado de la consulta

        if (status && status !== 'all') { 
            query += ` WHERE c.estado = ?`;
            queryParams.push(status);
        }

        query += ` ORDER BY c.fecha DESC`;

        const [appointments] = await pool.query(query, queryParams);
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error("Error al obtener citas de admin:", error);
        res.status(500).json({ success: false, message: "Error al obtener citas de admin", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// ### **VISUALIZACIÓN DE HISTORIALES MÉDICOS** (Endpoint para Admin)
app.get("/admin/historiales", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [records] = await pool.query(
            `SELECT h.id_historial, DATE_FORMAT(h.fecha_consulta, '%Y-%m-%d') as fecha_consulta, h.diagnostico, h.tratamiento, h.observaciones,
            m.nombre as mascota, m.especie, m.raza,
            CONCAT(p.nombre, ' ', p.apellido) as propietario,
            CONCAT(v.nombre, ' ', v.apellido) as veterinario
            FROM historial_medico h
            JOIN mascotas m ON h.id_mascota = m.id_mascota
            JOIN usuarios p ON m.id_propietario = p.id
            LEFT JOIN usuarios v ON h.veterinario = v.id
            ORDER BY h.fecha_consulta DESC`
        );
        res.json({ success: true, data: records });
    } catch (error) {
        console.error("Error al obtener historiales médicos de admin:", error);
        res.status(500).json({ success: false, message: "Error al obtener historiales médicos de admin", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

