const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnemd8wp0',
    api_key: process.env.CLOUDINARY_API_KEY || '418626316652541',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'NKTrcFgCXc-SUX_HNu61chc-f4M'
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    abortOnLimit: true,
    debug: true // Añadir para ver más logs de fileUpload
}));

// Configuración del pool de conexiones a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "veterinaria",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión a la base de datos al inicio
pool.getConnection()
    .then(conn => {
        console.log('Conectado a la base de datos MySQL');
        conn.release();
    })
    .catch(err => {
        console.error('Error de conexión a la base de datos:', err);
        process.exit(1);
    });

// Función para simular envío de correo electrónico
const simulateSendEmail = (toEmail, subject, body) => {
    console.log(`--- SIMULANDO ENVÍO DE CORREO ---`);
    console.log(`Para: ${toEmail}`);
    console.log(`Asunto: ${subject}`);
    console.log(`Cuerpo: \n${body}`);
    console.log(`----------------------------------`);
};

// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("Auth: No se proporcionó token.");
        return res.status(401).json({ success: false, message: "Acceso denegado. No se proporcionó token." });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) {
            console.error("Auth: Error de verificación JWT:", err);
            return res.status(403).json({ success: false, message: "Token inválido o expirado." });
        }
        req.user = { ...user, id: parseInt(user.id) };
        console.log("Auth: Usuario autenticado desde el token:", req.user.id, req.user.role);
        next();
    });
};

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        console.log(`Auth: Acceso denegado. Rol ${req.user.role} no es administrador.`);
        return res.status(403).json({ success: false, message: "Acceso denegado. Se requiere rol de administrador." });
    }
    next();
};

// Middleware para verificar rol de veterinario o administrador
const isVetOrAdmin = (req, res, next) => {
    if (req.user.role !== 'veterinario' && req.user.role !== 'admin') {
        console.log(`Auth: Acceso denegado. Rol ${req.user.role} no es veterinario ni administrador.`);
        return res.status(403).json({ success: false, message: "Acceso denegado. Se requiere rol de veterinario o administrador." });
    }
    next();
};

// Middleware para verificar si es el propietario del recurso, un veterinario o un administrador
const isOwnerOrAdmin = async (req, res, next) => {
    const userIdFromToken = req.user.id;
    const userRole = req.user.role;

    console.log(`[isOwnerOrAdmin START] User ID: ${userIdFromToken}, Role: ${userRole}, Original URL: ${req.originalUrl}, Path: ${req.path}, Method: ${req.method}`);

    // Admin y Veterinario siempre tienen acceso a los recursos que gestionan (excepto eliminaciones de usuarios, que son solo para admin)
    if (userRole === 'admin' || userRole === 'veterinario') {
        console.log(`[isOwnerOrAdmin] ${userRole} access granted. Calling next().`);
        return next();
    }

    // Si el rol es 'usuario', solo puede acceder a sus propios recursos.
    try {
        if (req.originalUrl.startsWith('/mascotas')) {
            if (req.method === 'GET') {
                const requestedOwnerId = parseInt(req.query.id_propietario);
                if (isNaN(requestedOwnerId) || requestedOwnerId !== userIdFromToken) {
                    console.log(`[isOwnerOrAdmin - /mascotas GET] Denegado: Usuario ${userIdFromToken} intentó acceder a mascotas de ${requestedOwnerId || 'propietario no especificado/diferente'}.`);
                    return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver tus propias mascotas." });
                }
                return next();
            } else if (req.method === 'POST') {
                const newPetOwnerId = parseInt(req.body.id_propietario);
                if (newPetOwnerId !== userIdFromToken) {
                    console.log(`[isOwnerOrAdmin - /mascotas POST] Denegado: Usuario ${userIdFromToken} intentó crear mascota para ${newPetOwnerId}.`);
                    return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes registrar mascotas para tu propio perfil." });
                }
                return next();
            } else if (req.params.id) { // PUT, DELETE /mascotas/:id
                const idMascota = parseInt(req.params.id);
                if (isNaN(idMascota)) {
                    console.log("[isOwnerOrAdmin - /mascotas/:id] ID de mascota inválido.");
                    return res.status(400).json({ success: false, message: "ID de mascota no válido." });
                }
                const [rows] = await pool.query("SELECT id_propietario FROM mascotas WHERE id_mascota = ?", [idMascota]);
                if (rows.length === 0) {
                    console.log(`[isOwnerOrAdmin - /mascotas/:id] Mascota con ID ${idMascota} no encontrada.`);
                    return res.status(404).json({ success: false, message: "Mascota no encontrada." });
                }
                const resourceOwnerId = rows[0].id_propietario;
                if (resourceOwnerId !== userIdFromToken) {
                    console.log(`[isOwnerOrAdmin - /mascotas/:id] Denegado: Usuario ${userIdFromToken} intentó modificar mascota de ${resourceOwnerId}.`);
                    return res.status(403).json({ success: false, message: "Acceso denegado. No eres el propietario de esta mascota." });
                }
                return next();
            }
        } else if (req.originalUrl.startsWith('/historial_medico')) {
            // Para GET de historial_medico/:id
            if (req.method === 'GET' && req.params.id) {
                const idHistorial = parseInt(req.params.id);
                if (isNaN(idHistorial)) {
                    console.log("[isOwnerOrAdmin - /historial_medico GET] ID de historial médico inválido.");
                    return res.status(400).json({ success: false, message: "ID de historial médico no válido." });
                }
                const [rows] = await pool.query(
                    "SELECT m.id_propietario FROM historial_medico h JOIN mascotas m ON h.id_mascota = m.id_mascota WHERE h.id_historial = ?",
                    [idHistorial]
                );
                if (rows.length === 0) {
                    console.log(`[isOwnerOrAdmin - /historial_medico GET] Historial médico con ID ${idHistorial} no encontrado.`);
                    return res.status(404).json({ success: false, message: "Historial médico no encontrado." });
                }
                const resourceOwnerId = rows[0].id_propietario;

                if (resourceOwnerId !== userIdFromToken) {
                    console.log(`[isOwnerOrAdmin - /historial_medico GET] Denegado: Usuario ${userIdFromToken} intentó acceder a historial médico de ${resourceOwnerId}.`);
                    return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver los historiales de tus propias mascotas." });
                }
                return next();
            }
        } else if (req.originalUrl.startsWith('/citas')) {
            // Para GET, PUT, DELETE /citas/:id
            if (req.params.id) {
                const idCita = parseInt(req.params.id);
                if (isNaN(idCita)) {
                    console.log("[isOwnerOrAdmin - /citas/:id] ID de cita inválido.");
                    return res.status(400).json({ success: false, message: "ID de cita no válido." });
                }
                const [rows] = await pool.query("SELECT id_cliente, id_veterinario FROM citas WHERE id_cita = ?", [idCita]);
                if (rows.length === 0) {
                    console.log(`[isOwnerOrAdmin - /citas/:id] Cita con ID ${idCita} no encontrada.`);
                    return res.status(404).json({ success: false, message: "Cita no encontrada." });
                }
                const resourceClientId = rows[0].id_cliente;
                const resourceVetId = rows[0].id_veterinario;

                if (resourceClientId !== userIdFromToken && resourceVetId !== userIdFromToken) {
                    console.log(`[isOwnerOrAdmin - /citas/:id] Denegado: Usuario ${userIdFromToken} intentó acceder a cita de cliente ${resourceClientId} o veterinario ${resourceVetId}.`);
                    return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para ver/modificar esta cita." });
                }
                return next();
            }
            // Para POST /citas (crear cita)
            if (req.method === 'POST') {
                const newCitaClientId = parseInt(req.body.id_cliente);
                if (newCitaClientId !== userIdFromToken) {
                    console.log(`[isOwnerOrAdmin - /citas POST] Denegado: Usuario ${userIdFromToken} intentó crear cita para ${newCitaClientId}.`);
                    return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes crear citas para tu propio perfil." });
                }
                return next();
            }
            // Para GET /citas (listar citas)
            if (req.method === 'GET') {
                // La lógica de filtrado por id_cliente o id_veterinario ya está en la ruta /citas
                // Este middleware solo asegura que un usuario solo pueda ver sus propias citas si no es admin/vet
                return next();
            }

        } else if (req.originalUrl.startsWith('/usuarios')) {
            const targetUserId = parseInt(req.params.id);
            if (isNaN(targetUserId)) {
                console.log("[isOwnerOrAdmin - /usuarios] ID de usuario inválido.");
                return res.status(400).json({ success: false, message: "ID de usuario no válido." });
            }
            if (targetUserId !== userIdFromToken) {
                console.log(`[isOwnerOrAdmin - /usuarios] Denegado: Usuario ${userIdFromToken} intentó acceder al perfil de ${targetUserId}.`);
                return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver/modificar tu propio perfil." });
            }
            return next();

        } else if (req.originalUrl.startsWith('/notifications')) {
            const notificationId = parseInt(req.params.id);
            if (isNaN(notificationId)) {
                console.log("[isOwnerOrAdmin - /notifications] ID de notificación inválido.");
                return res.status(400).json({ success: false, message: "ID de notificación no válido." });
            }
            const [rows] = await pool.query("SELECT id_usuario FROM notificaciones WHERE id_notificacion = ?", [notificationId]);
            if (rows.length === 0) {
                console.log(`[isOwnerOrAdmin - /notifications] Notificación con ID ${notificationId} no encontrada.`);
                return res.status(404).json({ success: false, message: "Notificación no encontrada." });
            }
            const resourceOwnerId = rows[0].id_usuario;
            if (resourceOwnerId !== userIdFromToken) {
                console.log(`[isOwnerOrAdmin - /notifications] Denegado: Usuario ${userIdFromToken} intentó acceder a notificación de ${resourceOwnerId}.`);
                return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver/modificar tus propias notificaciones." });
            }
            return next();
        }

        // Fallback: Si ninguna de las reglas específicas coincidió para el rol 'usuario', denegar el acceso.
        console.log(`[isOwnerOrAdmin END] Fallback: Acceso denegado para el usuario ${userIdFromToken} con rol ${userRole}. Ninguna regla específica de usuario coincidió.`);
        return res.status(403).json({ success: false, message: "Acceso denegado. Permisos insuficientes para este tipo de recurso." });

    } catch (error) {
        console.error("Error en el middleware isOwnerOrAdmin:", error);
        return res.status(500).json({ success: false, message: "Error al verificar permisos." });
    }
};


// Ruta de prueba
app.get("/", (req, res) => {
    res.send("Servidor de veterinaria funcionando correctamente");
});

// =============================================
// RUTAS DE AUTENTICACIÓN
// =============================================

// Aplicar express.json solo a las rutas que lo necesitan
app.post("/login", express.json(), async (req, res) => {
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

        // Crear token JWT con el ID, email y rol del usuario
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        // Envía los datos del usuario y el token como respuesta
        res.json({
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            role: user.role,
            imagen_url: user.imagen_url,
            token
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// Ruta de registro para usuarios normales (rol 'usuario')
app.post("/register", express.json(), async (req, res) => {
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
            id: result.insertId,
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
app.post("/forgot-password", express.json(), async (req, res) => {
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

        res.json({
            success: true,
            message: "Token de recuperación generado",
            resetToken: resetToken
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
app.post("/verify-reset-code", express.json(), async (req, res) => {
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
app.post("/reset-password", express.json(), async (req, res) => {
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

        const hashedPassword = await bcrypt.hash(newPassword, 10);

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
// RUTAS DE CLOUDINARY
// =============================================

// Esta ruta no necesita express.json() porque fileUpload ya maneja el body
app.post('/upload-image', authenticateToken, async (req, res) => {
    try {
        console.log("Received upload request. Files:", req.files);
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.image) {
            return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo o el campo "image" está vacío.' });
        }

        const file = req.files.image;
        console.log("File received:", file.name, file.mimetype, file.size);

        const uploadOptions = {};
        if (file.tempFilePath) {
            // Si express-fileupload usa archivos temporales (useTempFiles: true)
            uploadOptions.file = file.tempFilePath;
        } else if (file.data) {
            // Si express-fileupload maneja el archivo en memoria (useTempFiles: false o por defecto para pequeños)
            // Cloudinary puede subir desde un Buffer directamente si se le pasa como data URI
            uploadOptions.file = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
        } else {
            return res.status(500).json({ success: false, message: 'No se pudo acceder al archivo subido (ni tempFilePath ni data).' });
        }

        const result = await cloudinary.uploader.upload(uploadOptions.file, {
            folder: 'flookypets_profiles', // Asegúrate de que esta carpeta exista o se cree automáticamente
        });

        // Si se usaron archivos temporales, eliminarlos después de subir
        if (file.tempFilePath) {
            const fs = require('fs'); // Importar 'fs' solo si es necesario
            fs.unlink(file.tempFilePath, (err) => {
                if (err) console.error("Error al eliminar archivo temporal:", err);
            });
        }

        res.json({ success: true, message: 'Imagen subida correctamente.', imageUrl: result.secure_url });

    } catch (error) {
        console.error("Error al subir imagen a Cloudinary:", error);
        // Envía el mensaje de error de Cloudinary al frontend para una depuración más fácil
        res.status(500).json({
            success: false,
            message: `Error al subir imagen: ${error.message || 'Error desconocido de Cloudinary.'}`,
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
             LIMIT 12`
        );
        res.json({ success: true, data: citasPorMes });
    }
    catch (error) {
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
             LIMIT 5`
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
            `SELECT id, nombre, apellido, email, telefono, direccion, active, imagen_url,
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
app.post("/api/admin/administrators", authenticateToken, express.json(), isAdmin, async (req, res) => {
    const { nombre, apellido, email, telefono, direccion, password, imagen_url } = req.body;

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
            (nombre, apellido, email, telefono, direccion, password, role, imagen_url)
            VALUES (?, ?, ?, ?, ?, ?, 'admin', ?)`,
            [nombre, apellido, email, telefono, direccion, hashedPassword, imagen_url || null]
        );

        // Obtener el administrador recién creado para devolverlo en la respuesta
        const [newAdmin] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, active, imagen_url,
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
app.put("/api/admin/administrators/:id", authenticateToken, express.json(), isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion, imagen_url } = req.body;

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

        // Construir la consulta de actualización dinámicamente
        const fields = [];
        const values = [];
        if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
        if (apellido !== undefined) { fields.push('apellido = ?'); values.push(apellido); }
        if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono); }
        if (direccion !== undefined) { fields.push('direccion = ?'); values.push(direccion); }
        if (imagen_url !== undefined) { fields.push('imagen_url = ?'); values.push(imagen_url); }


        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "No hay datos para actualizar." });
        }

        const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ? AND role = 'admin'`;
        values.push(id);

        await pool.query(query, values);

        // Obtener el administrador actualizado para devolverlo en la respuesta
        const [updatedAdmin] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, active, imagen_url,
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
app.get("/usuarios/veterinarios", authenticateToken, isVetOrAdmin, async (req, res) => {
    try {
        const [vets] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion, active, imagen_url, created_at FROM usuarios WHERE role = 'veterinario'"
        );
        res.json({ success: true, data: vets });
    } catch (error) {
        console.error("Error al obtener veterinarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener veterinarios", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Crear nuevo veterinario
app.post("/usuarios/veterinarios", authenticateToken, express.json(), isAdmin, async (req, res) => {
    const { nombre, apellido, email, telefono, direccion, password, experiencia, universidad, horario, imagen_url } = req.body;

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
            (nombre, apellido, email, telefono, direccion, password, role, experiencia, universidad, horario, imagen_url)
            VALUES (?, ?, ?, ?, ?, ?, 'veterinario', ?, ?, ?, ?)`,
            [nombre, apellido, email, telefono, direccion, hashedPassword, experiencia || null, universidad || null, horario || null, imagen_url || null]
        );

        // Obtener el veterinario recién creado para devolverlo en la respuesta
        const [newVet] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion, active, imagen_url, created_at FROM usuarios WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({ success: true, message: "Veterinario creado correctamente", data: newVet[0] });
    } catch (error) {
        console.error("Error al crear veterinario:", error);
        res.status(500).json({ success: false, message: "Error al crear veterinario", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar veterinario
app.put("/usuarios/veterinarios/:id", authenticateToken, express.json(), isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion, active, experiencia, universidad, horario, imagen_url } = req.body;

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
        if (active !== undefined) { fields.push('active = ?'); values.push(active ? 1 : 0); }
        if (experiencia !== undefined) { fields.push('experiencia = ?'); values.push(experiencia); }
        if (universidad !== undefined) { fields.push('universidad = ?'); values.push(universidad); }
        if (horario !== undefined) { fields.push('horario = ?'); values.push(horario); }
        if (imagen_url !== undefined) { fields.push('imagen_url = ?'); values.push(imagen_url); }


        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "No hay datos para actualizar." });
        }

        const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ? AND role = 'veterinario'`;
        values.push(id);

        await pool.query(query, values);

        // Obtener el veterinario actualizado para devolverlo en la respuesta
        const [updatedVet] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion, active, imagen_url, created_at FROM usuarios WHERE id = ?",
            [id]
        );

        res.json({ success: true, message: "Veterinario actualizado correctamente", data: updatedVet[0] });
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
app.get("/servicios", authenticateToken, async (req, res) => {
    try {
        const [services] = await pool.query("SELECT * FROM servicios");
        res.json({ success: true, data: services });
    } catch (error) {
        console.error("Error al obtener servicios:", error);
        res.status(500).json({ success: false, message: "Error al obtener servicios", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Crear nuevo servicio
app.post("/servicios", authenticateToken, express.json(), isAdmin, async (req, res) => {
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

        res.status(201).json({ success: true, message: "Servicio creado correctamente", data: newService[0] });
    } catch (error) {
        console.error("Error al crear servicio:", error);
        res.status(500).json({ success: false, message: "Error al crear servicio", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar servicio
app.put("/servicios/:id", authenticateToken, express.json(), isAdmin, async (req, res) => {
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

        res.json({ success: true, message: "Servicio actualizado correctamente", data: updatedService[0] });
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
            `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.direccion, u.active, u.imagen_url,
             COUNT(m.id_mascota) as num_mascotas, u.created_at, u.tipo_documento, u.numero_documento, u.fecha_nacimiento
             FROM usuarios u
             LEFT JOIN mascotas m ON u.id = m.id_propietario
             WHERE u.role = 'usuario'
             GROUP BY u.id
             ORDER BY u.created_at DESC`
        );
        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Error al obtener usuarios (clientes) para admin:", error);
        res.status(500).json({ success: false, message: "Error al obtener usuarios para admin", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// NUEVA RUTA: Obtener todos los usuarios con role 'usuario' para veterinarios (y admins)
app.get("/usuarios", authenticateToken, isVetOrAdmin, async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.direccion, u.active, u.imagen_url, u.role,
             COUNT(m.id_mascota) as num_mascotas, u.created_at, u.tipo_documento, u.numero_documento, u.fecha_nacimiento
             FROM usuarios u
             LEFT JOIN mascotas m ON u.id = m.id_propietario
             WHERE u.role = 'usuario'
             GROUP BY u.id
             ORDER BY u.created_at DESC`
        );
        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Error al obtener usuarios (clientes) para veterinarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener usuarios para veterinarios", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// Obtener detalles de un usuario por ID (para AdminUserDetail.js, perfil de usuario, y veterinarios)
app.get("/usuarios/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [user] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento,
                    fecha_nacimiento, role, active, created_at, experiencia, universidad, horario, imagen_url,
                    notificaciones_activas, sonido_notificacion, recordatorios_cita, intervalo_recordatorio
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
app.put("/usuarios/:id", authenticateToken, express.json(), isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    const {
        nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento,
        fecha_nacimiento, active, password, experiencia, universidad, horario, imagen_url,
        notificaciones_activas, sonido_notificacion, recordatorios_cita, intervalo_recordatorio
    } = req.body;

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

        if (active !== undefined && (req.user.role === 'admin' || (req.user.id === parseInt(id)))) {
            fields.push('active = ?'); values.push(active ? 1 : 0);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push('password = ?'); values.push(hashedPassword);
        }

        if (req.user.role === 'admin' || (req.user.role === 'veterinario' && req.user.id === parseInt(id))) {
            if (experiencia !== undefined) { fields.push('experiencia = ?'); values.push(experiencia); }
            if (universidad !== undefined) { fields.push('universidad = ?'); values.push(universidad); }
            if (horario !== undefined) { fields.push('horario = ?'); values.push(horario); }
        }

        // La imagen_url puede venir en el body si no se cambió el archivo, o se actualizó con la URL de Cloudinary
        if (imagen_url !== undefined) { fields.push('imagen_url = ?'); values.push(imagen_url); }

        if (notificaciones_activas !== undefined) { fields.push('notificaciones_activas = ?'); values.push(notificaciones_activas ? 1 : 0); }
        if (sonido_notificacion !== undefined) { fields.push('sonido_notificacion = ?'); values.push(sonido_notificacion); }
        if (recordatorios_cita !== undefined) { fields.push('recordatorios_cita = ?'); values.push(recordatorios_cita ? 1 : 0); }
        if (intervalo_recordatorio !== undefined) { fields.push('intervalo_recordatorio = ?'); values.push(intervalo_recordatorio); }


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
                    fecha_nacimiento, role, active, created_at, experiencia, universidad, horario, imagen_url,
                    notificaciones_activas, sonido_notificacion, recordatorios_cita, intervalo_recordatorio
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
        const [result] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);

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
app.get("/mascotas", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    try {
        const { id_propietario } = req.query;
        let query = `SELECT m.*, CONCAT(u.nombre, ' ', u.apellido) as propietario_nombre
                     FROM mascotas m
                     JOIN usuarios u ON m.id_propietario = u.id`;
        const queryParams = [];

        if (req.user.role === 'usuario') {
            query += ` WHERE m.id_propietario = ?`;
            queryParams.push(req.user.id);
        } else if (id_propietario) {
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
app.post("/mascotas", authenticateToken, express.json(), isVetOrAdmin, async (req, res) => {
    const { nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario, imagen_url } = req.body;

    if (!nombre || !especie || !id_propietario) {
        return res.status(400).json({ success: false, message: "Nombre, especie y ID de propietario son requeridos." });
    }

    try {
        // Verificar que el propietario exista y sea un usuario regular
        const [owner] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'usuario'", [id_propietario]);
        if (owner.length === 0) {
            return res.status(400).json({ success: false, message: "ID de propietario no válido." });
        }

        const [result] = await pool.query(
            `INSERT INTO mascotas (nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario, imagen_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario, imagen_url || null]
        );

        const [newMascota] = await pool.query("SELECT * FROM mascotas WHERE id_mascota = ?", [result.insertId]);

        res.status(201).json({ success: true, message: "Mascota registrada correctamente.", data: newMascota[0] });
    } catch (error) {
        console.error("Error al registrar mascota:", error);
        res.status(500).json({ success: false, message: "Error al registrar mascota.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar mascota
app.put("/mascotas/:id", authenticateToken, express.json(), isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario, imagen_url } = req.body;

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
        if (imagen_url !== undefined) { fields.push('imagen_url = ?'); values.push(imagen_url); }

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

app.delete("/mascotas/:id", authenticateToken, isVetOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM historial_medico WHERE id_mascota = ?", [id]);

        const [result] = await pool.query("DELETE FROM mascotas WHERE id_mascota = ?", [id]);

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
// RUTAS DE GESTIÓN DE HISTORIAL MÉDICO (Actualizadas para Veterinarios y Usuarios)
// =============================================

// Obtener todos los historiales médicos (para veterinarios y administradores)
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

// Obtener un historial médico por ID (para propietarios, veterinarios y administradores)
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
app.post("/historial_medico", authenticateToken, express.json(), isVetOrAdmin, async (req, res) => {
    const { id_mascota, fecha_consulta, diagnostico, tratamiento, observaciones, veterinario, peso_actual, temperatura, proxima_cita } = req.body;

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
            `INSERT INTO historial_medico (id_mascota, fecha_consulta, diagnostico, tratamiento, observaciones, veterinario, peso_actual, temperatura, proxima_cita)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_mascota, fecha_consulta, diagnostico, tratamiento, observaciones, veterinario, peso_actual || null, temperatura || null, proxima_cita || null]
        );

        const [newRecord] = await pool.query("SELECT * FROM historial_medico WHERE id_historial = ?", [result.insertId]);

        res.status(201).json({ success: true, message: "Historial médico registrado correctamente.", data: newRecord[0] });
    } catch (error) {
        console.error("Error al registrar historial médico:", error);
        res.status(500).json({ success: false, message: "Error al registrar historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar historial médico (solo para veterinarios o admins)
app.put("/historial_medico/:id", authenticateToken, express.json(), isVetOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { fecha_consulta, diagnostico, tratamiento, observaciones, veterinario, peso_actual, temperatura, proxima_cita } = req.body;

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
        if (peso_actual !== undefined) { fields.push('peso_actual = ?'); values.push(peso_actual); }
        if (temperatura !== undefined) { fields.push('temperatura = ?'); values.push(temperatura); }
        if (proxima_cita !== undefined) { fields.push('proxima_cita = ?'); values.push(proxima_cita); }


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
// RUTAS DE GESTIÓN DE CITAS (MODIFICADAS Y NUEVAS)
// =============================================

// **NUEVA RUTA:** Obtener las últimas citas registradas para el veterinario logeado (para el Dashboard)
app.get("/veterinario/citas/ultimas", authenticateToken, isVetOrAdmin, async (req, res) => {
    try {
        const veterinarioId = req.user.id;
        const [citas] = await pool.query(
            `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d %H:%i') as fecha_cita, c.estado,
                    s.nombre as servicio_nombre,
                    CONCAT(u_cli.nombre, ' ', u_cli.apellido) as propietario_nombre,
                    u_cli.apellido as propietario_apellido,
                    m.nombre as mascota_nombre, m.especie as mascota_especie
             FROM citas c
             JOIN servicios s ON c.id_servicio = s.id_servicio
             JOIN usuarios u_cli ON c.id_cliente = u_cli.id
             JOIN mascotas m ON c.id_mascota = m.id_mascota
             WHERE c.id_veterinario = ?
             ORDER BY c.fecha DESC
             LIMIT 5`, // Últimas 5 citas
            [veterinarioId]
        );
        res.json({ success: true, data: citas });
    } catch (error) {
        console.error("Error al obtener últimas citas para veterinario:", error);
        res.status(500).json({ success: false, message: "Error al obtener últimas citas.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// **NUEVA RUTA:** Obtener el conteo de citas completadas para el veterinario logeado (para el Dashboard)
app.get("/veterinario/citas/completadas/count", authenticateToken, isVetOrAdmin, async (req, res) => {
    try {
        const veterinarioId = req.user.id;
        const [[{ count }]] = await pool.query(
            `SELECT COUNT(*) as count FROM citas WHERE id_veterinario = ? AND estado = 'completa'`,
            [veterinarioId]
        );
        res.json({ success: true, count });
    } catch (error) {
        console.error("Error al obtener conteo de citas completadas para veterinario:", error);
        res.status(500).json({ success: false, message: "Error al obtener conteo de citas completadas.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// Obtener todas las citas (MODIFICADA para aceptar parámetro de fecha)
app.get("/citas", authenticateToken, async (req, res) => {
    try {
        const { fecha } = req.query; // Obtener el parámetro de fecha
        let query = `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d %H:%i') as fecha_cita, c.estado, c.servicios as notas_adicionales,
                            s.nombre as servicio_nombre, s.precio,
                            CONCAT(u_cli.nombre, ' ', u_cli.apellido) as propietario_nombre,
                            u_cli.apellido as propietario_apellido,
                            u_cli.telefono as propietario_telefono,
                            u_cli.direccion as propietario_direccion,
                            u_cli.email as propietario_email,
                            CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre,
                            u_vet.apellido as veterinario_apellido,
                            u_vet.email as veterinario_email,
                            u_vet.direccion as veterinario_direccion,
                            s.id_servicio, u_cli.id as id_cliente, u_vet.id as id_veterinario,
                            m.nombre as mascota_nombre, m.especie as mascota_especie, m.raza as mascota_raza
                     FROM citas c
                     JOIN servicios s ON c.id_servicio = s.id_servicio
                     JOIN usuarios u_cli ON c.id_cliente = u_cli.id
                     LEFT JOIN usuarios u_vet ON c.id_veterinario = u_vet.id
                     LEFT JOIN mascotas m ON c.id_mascota = m.id_mascota
                     `;
        const queryParams = [];
        const conditions = [];

        // Filtro por rol: Administrador ve todas, Veterinario solo las suyas, Usuario solo las suyas.
        if (req.user.role === 'veterinario') {
            conditions.push(`c.id_veterinario = ?`);
            queryParams.push(req.user.id);
        } else if (req.user.role === 'usuario') {
            conditions.push(`c.id_cliente = ?`);
            queryParams.push(req.user.id);
        }

        // Filtrar por fecha si se proporciona
        if (fecha) {
            conditions.push(`DATE(c.fecha) = ?`);
            queryParams.push(fecha);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
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
            `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d %H:%i') as fecha_cita, c.estado, c.servicios as observaciones,
                    s.nombre as servicio_nombre, s.precio, s.id_servicio,
                    u_cli.id as id_cliente, CONCAT(u_cli.nombre, ' ', u_cli.apellido) as propietario_nombre, u_cli.telefono as propietario_telefono, u_cli.email as propietario_email, u_cli.direccion as propietario_direccion,
                    u_vet.id as id_veterinario, CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre, u_vet.email as veterinario_email,
                    u_vet.direccion as veterinario_direccion,
                    m.nombre as mascota_nombre, m.especie as mascota_especie, m.raza as mascota_raza
             FROM citas c
             JOIN servicios s ON c.id_servicio = s.id_servicio
             JOIN usuarios u_cli ON c.id_cliente = u_cli.id
             LEFT JOIN usuarios u_vet ON c.id_veterinario = u_vet.id
             LEFT JOIN mascotas m ON c.id_mascota = m.id_mascota
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

// Registrar nueva cita (para usuarios y admins/vets)
app.post("/citas/agendar", authenticateToken, express.json(), async (req, res) => { // Cambiado a /citas/agendar para mayor claridad
    const { fecha_cita, notas_adicionales, id_servicio, id_cliente, id_veterinario, id_mascota } = req.body;
    let estado = req.body.estado || 'pendiente';

    if (!fecha_cita || !id_servicio || !id_cliente || !id_mascota) {
        return res.status(400).json({ success: false, message: "Fecha, servicio, cliente y mascota son requeridos para la cita." });
    }

    if (req.user.role === 'usuario' && req.user.id !== id_cliente) {
        return res.status(403).json({ success: false, message: "Acceso denegado. No puedes crear citas para otros usuarios." });
    }

    let assignedVetId = id_veterinario;

    try {
        const [service] = await pool.query("SELECT id_servicio, nombre FROM servicios WHERE id_servicio = ?", [id_servicio]);
        if (service.length === 0) {
            return res.status(400).json({ success: false, message: "ID de servicio no válido." });
        }
        const servicio_nombre = service[0].nombre;

        const [cliente] = await pool.query("SELECT id, nombre, apellido, email FROM usuarios WHERE id = ? AND role = 'usuario'", [id_cliente]);
        if (cliente.length === 0) {
            return res.status(400).json({ success: false, message: "ID de cliente no válido o no es un usuario." });
        }
        const cliente_nombre = `${cliente[0].nombre} ${cliente[0].apellido}`;
        const cliente_email = cliente[0].email;

        const [mascota] = await pool.query("SELECT id_mascota, nombre FROM mascotas WHERE id_mascota = ? AND id_propietario = ?", [id_mascota, id_cliente]);
        if (mascota.length === 0) {
            return res.status(400).json({ success: false, message: "ID de mascota no válido o la mascota no pertenece a este cliente." });
        }
        const mascota_nombre = mascota[0].nombre;

        if (!assignedVetId) {
            const [vets] = await pool.query("SELECT id FROM usuarios WHERE role = 'veterinario' AND active = 1");
            if (vets.length === 0) {
                return res.status(500).json({ success: false, message: "No hay veterinarios disponibles para asignar la cita." });
            }
            const randomIndex = Math.floor(Math.random() * vets.length);
            assignedVetId = vets[randomIndex].id;
            estado = 'pendiente';
        } else {
            const [vet] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'veterinario'", [assignedVetId]);
            if (vet.length === 0) {
                return res.status(400).json({ success: false, message: "ID de veterinario no válido o no es un veterinario." });
            }
        }

        const [result] = await pool.query(
            `INSERT INTO citas (fecha, estado, servicios, id_servicio, id_cliente, id_veterinario, id_mascota)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [fecha_cita, estado, notas_adicionales || null, id_servicio, id_cliente, assignedVetId, id_mascota]
        );

        const newCitaId = result.insertId;
        const [newCita] = await pool.query("SELECT * FROM citas WHERE id_cita = ?", [newCitaId]);

        if (req.user.role === 'usuario') {
            const [assignedVet] = await pool.query("SELECT nombre, apellido, email FROM usuarios WHERE id = ?", [assignedVetId]);
            const vetName = assignedVet.length > 0 ? `${assignedVet[0].nombre} ${assignedVet[0].apellido}` : 'Veterinario asignado';
            const vetEmail = assignedVet.length > 0 ? assignedVet[0].email : null;

            await pool.query(
                `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                [assignedVetId, 'cita_creada_vet', `Nueva cita pendiente de ${cliente_nombre} para ${mascota_nombre} (${servicio_nombre}) el ${fecha_cita}.`, newCitaId]
            );

            if (vetEmail) {
                simulateSendEmail(
                    vetEmail,
                    `Nueva Cita Pendiente - Flooky Pets`,
                    `Hola Dr./Dra. ${vetName},\n\nSe ha solicitado una nueva cita pendiente:\n\nCliente: ${cliente_nombre}\nMascota: ${mascota_nombre}\nServicio: ${servicio_nombre}\nFecha y Hora: ${fecha_cita}\n\nPor favor, revisa tu panel para ACEPTAR o RECHAZAR esta cita.\n\nSaludos,\nEl equipo de Flooky Pets`
                );
            }

            await pool.query(
                `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                [id_cliente, 'cita_registrada_user', `Tu cita para ${mascota_nombre} (${servicio_nombre}) el ${fecha_cita} ha sido registrada y está PENDIENTE de confirmación.`, newCitaId]
            );

        }
        else if (req.user.role !== 'usuario') {
            await pool.query(
                `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                [id_cliente, 'cita_creada_admin_vet', `Se ha registrado una cita para ${mascota_nombre} (${servicio_nombre}) el ${fecha_cita}. Estado: ${estado}.`, newCitaId]
            );

            if (estado === 'aceptada') {
                const [vetInfo] = await pool.query("SELECT nombre, apellido, email, direccion FROM usuarios WHERE id = ?", [assignedVetId]);
                const vetDetails = vetInfo.length > 0 ? vetInfo[0] : {};
                simulateSendEmail(
                    cliente_email,
                    `Confirmación de Cita Aceptada - Flooky Pets`,
                    `Hola ${cliente_nombre},\n\nTu cita para el servicio de ${servicio_nombre} para ${mascota_nombre} ha sido ACEPTADA.\n\nDetalles de la cita:\nFecha y Hora: ${fecha_cita}\nVeterinario: ${vetDetails.nombre || ''} ${vetDetails.apellido || ''}\nUbicación: ${vetDetails.direccion || 'No especificada'}\n\n¡Te esperamos!\n\nSaludos,\nEl equipo de Flooky Pets`
                );
            }
        }

        res.status(201).json({ success: true, message: "Cita registrada correctamente.", data: newCita[0] });
    } catch (error) {
        console.error("Error al registrar cita:", error);
        res.status(500).json({ success: false, message: "Error al registrar cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar cita (admin/vet/owner for cancel)
app.put("/citas/:id", authenticateToken, express.json(), async (req, res) => {
    const { id } = req.params;
    let { fecha_cita, estado, notas_adicionales, id_servicio, id_cliente, id_veterinario, id_mascota } = req.body;

    try {
        const userIdFromToken = req.user.id;
        const userRole = req.user.role;

        const [citaResult] = await pool.query("SELECT id_cliente, id_veterinario, estado, id_mascota FROM citas WHERE id_cita = ?", [id]);
        if (citaResult.length === 0) {
            return res.status(404).json({ success: false, message: "Cita no encontrada." });
        }
        const existingCita = citaResult[0];
        const oldEstado = existingCita.estado;

        let isAuthorized = false;

        if (userRole === 'admin') {
            isAuthorized = true;
        } else if (userRole === 'usuario') {
            if (userIdFromToken === existingCita.id_cliente && estado === 'cancelada') {
                isAuthorized = true;
            }
            if (userIdFromToken === existingCita.id_cliente && existingCita.estado === 'pendiente' && (estado === 'aceptada' || estado === 'rechazada')) {
                isAuthorized = true;
            }
        } else if (userRole === 'veterinario') {
            if (userIdFromToken === existingCita.id_veterinario) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para realizar esta acción." });
        }

        const fields = [];
        const values = [];

        if (fecha_cita !== undefined) { fields.push('fecha = ?'); values.push(fecha_cita); }

        if (estado !== undefined) {
            fields.push('estado = ?'); values.push(estado);
        }

        if (notas_adicionales !== undefined) { fields.push('servicios = ?'); values.push(notas_adicionales); }

        if (id_servicio !== undefined) {
            const [service] = await pool.query("SELECT id_servicio FROM servicios WHERE id_servicio = ?", [id_servicio]);
            if (service.length === 0) return res.status(400).json({ success: false, message: "ID de servicio no válido." });
            fields.push('id_servicio = ?'); values.push(id_servicio);
        }

        if (id_mascota !== undefined) {
            const [mascota] = await pool.query("SELECT id_mascota FROM mascotas WHERE id_mascota = ? AND id_propietario = ?", [id_mascota, existingCita.id_cliente]);
            if (mascota.length === 0) return res.status(400).json({ success: false, message: "ID de mascota no válido o la mascota no pertenece a este cliente." });
            fields.push('id_mascota = ?'); values.push(id_mascota);
        }

        if (userRole === 'admin') {
            if (id_cliente !== undefined) {
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

        const [updatedCitaRows] = await pool.query(
            `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d %H:%i') as fecha_cita, c.estado, c.servicios as observaciones,
                    s.nombre as servicio_nombre, s.precio, s.id_servicio,
                    u_cli.id as id_cliente, CONCAT(u_cli.nombre, ' ', u_cli.apellido) as propietario_nombre, u_cli.telefono as propietario_telefono, u_cli.email as propietario_email, u_cli.direccion as propietario_direccion,
                    u_vet.id as id_veterinario, CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre, u_vet.email as veterinario_email,
                    u_vet.direccion as veterinario_direccion,
                    m.nombre as mascota_nombre, m.especie as mascota_especie, m.raza as mascota_raza
             FROM citas c
             JOIN servicios s ON c.id_servicio = s.id_servicio
             JOIN usuarios u_cli ON c.id_cliente = u_cli.id
             LEFT JOIN usuarios u_vet ON c.id_veterinario = u_vet.id
             LEFT JOIN mascotas m ON c.id_mascota = m.id_mascota
             WHERE c.id_cita = ?`,
            [id]
        );
        const updatedCita = updatedCitaRows[0];

        if (estado !== oldEstado) {
            const clienteEmail = updatedCita.propietario_email; // Usar propietario_email
            const clienteId = updatedCita.id_cliente;
            const servicioNombre = updatedCita.servicio_nombre;
            const citaFecha = updatedCita.fecha_cita; // Usar fecha_cita
            const veterinarioNombre = updatedCita.veterinario_nombre;
            const veterinarioEmail = updatedCita.veterinario_email;
            const veterinarioId = updatedCita.id_veterinario;
            const mascotaNombre = updatedCita.mascota_nombre;


            if (estado === 'aceptada') {
                await pool.query(
                    `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                    [clienteId, 'cita_aceptada_user', `Tu cita para ${mascotaNombre} (${servicioNombre}) el ${citaFecha} ha sido ACEPTADA por ${veterinarioNombre}.`, id]
                );
                simulateSendEmail(
                    clienteEmail,
                    `Confirmación de Cita Aceptada - Flooky Pets`,
                    `Hola ${updatedCita.propietario_nombre},\n\nTu cita para el servicio de ${servicioNombre} para ${mascotaNombre} ha sido ACEPTADA.\n\nDetalles de la cita:\nFecha y Hora: ${citaFecha}\nVeterinario: ${veterinarioNombre}\nUbicación: ${updatedCita.veterinario_direccion || 'No especificada'}\n\n¡Te esperamos!\n\nSaludos,\nEl equipo de Flooky Pets`
                );
            } else if (estado === 'rechazada') {
                await pool.query(
                    `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                    [clienteId, 'cita_rechazada_user', `Tu cita para ${mascotaNombre} (${servicioNombre}) el ${citaFecha} ha sido RECHAZADA por ${veterinarioNombre}. Por favor, reagenda o contacta al veterinario.`, id]
                );
            } else if (estado === 'cancelada') {
                if (userRole === 'usuario' && userIdFromToken === clienteId) {
                    await pool.query(
                        `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                        [veterinarioId, 'cita_cancelada_vet', `La cita de ${updatedCita.propietario_nombre} para ${mascotaNombre} el ${citaFecha} ha sido CANCELADA por el cliente.`, id]
                    );
                }
                else if (userRole === 'veterinario' && userIdFromToken === veterinarioId) {
                    await pool.query(
                        `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                        [clienteId, 'cita_cancelada_user', `Tu cita para ${mascotaNombre} (${servicioNombre}) el ${citaFecha} ha sido CANCELADA por el veterinario ${veterinarioNombre}.`, id]
                    );
                }
                else if (userRole === 'admin') {
                    await pool.query(
                        `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                        [clienteId, 'cita_cancelada_admin', `Tu cita para ${mascotaNombre} (${servicioNombre}) el ${citaFecha} ha sido CANCELADA por un administrador.`, id]
                    );
                    if (veterinarioId) {
                        await pool.query(
                            `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                            [veterinarioId, 'cita_cancelada_admin', `La cita de ${updatedCita.propietario_nombre} para ${mascotaNombre} el ${citaFecha} ha sido CANCELADA por un administrador.`, id]
                        );
                    }
                }
            }
        }

        res.json({ success: true, message: "Cita actualizada correctamente.", data: updatedCita });

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
// RUTAS DE GESTIÓN DE NOTIFICACIONES
// =============================================

// Obtener notificaciones para un usuario específico (cliente o veterinario)
app.get("/notifications/user/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para ver estas notificaciones." });
    }
    try {
        const [notifications] = await pool.query(
            `SELECT id_notificacion, id_usuario, tipo, mensaje, leida, fecha_creacion, referencia_id
             FROM notificaciones
             WHERE id_usuario = ?
             ORDER BY fecha_creacion DESC`,
            [id]
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        res.status(500).json({ success: false, message: "Error al obtener notificaciones.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Marcar notificación como leída
app.put("/notifications/:id/read", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [notification] = await pool.query("SELECT id_usuario FROM notificaciones WHERE id_notificacion = ?", [id]);
        if (notification.length === 0) {
            return res.status(404).json({ success: false, message: "Notificación no encontrada." });
        }
        if (req.user.id !== notification[0].id_usuario && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para modificar esta notificación." });
        }

        const [result] = await pool.query(
            "UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = ?",
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Notificación no encontrada o ya estaba leída." });
        }
        res.json({ success: true, message: "Notificación marcada como leída." });
    } catch (error) {
        console.error("Error al marcar notificación como leída:", error);
        res.status(500).json({ success: false, message: "Error al marcar notificación como leída.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar notificación
app.delete("/notifications/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [notification] = await pool.query("SELECT id_usuario FROM notificaciones WHERE id_notificacion = ?", [id]);
        if (notification.length === 0) {
            return res.status(404).json({ success: false, message: "Notificación no encontrada." });
        }
        if (req.user.id !== notification[0].id_usuario && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para eliminar esta notificación." });
        }

        const [result] = await pool.query("DELETE FROM notificaciones WHERE id_notificacion = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Notificación no encontrada." });
        }
        res.json({ success: true, message: "Notificación eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar notificación:", error);
        res.status(500).json({ success: false, message: "Error al eliminar notificación.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// =============================================
// RUTAS YA EXISTENTES Y AJUSTADAS PARA COHERENCIA
// =============================================

// ### **VISUALIZACIÓN DE CITAS** (Endpoint para Admin)
app.get("/admin/citas", authenticateToken, isAdmin, async (req, res) => {
    try {
        let query = `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%d %H:%i') as fecha, c.estado, c.servicios as notas_adicionales,
            s.nombre as servicio, s.precio,
            CONCAT(cl.nombre, ' ', cl.apellido) as cliente, cl.telefono as cliente_telefono,
            CONCAT(v.nombre, ' ', v.apellido) as veterinario,
            s.id_servicio, cl.id as id_cliente, v.id as id_veterinario,
            m.nombre as mascota_nombre, m.especie as mascota_especie
            FROM citas c
            JOIN servicios s ON c.id_servicio = s.id_servicio
            JOIN usuarios cl ON c.id_cliente = cl.id
            LEFT JOIN usuarios v ON c.id_veterinario = v.id
            LEFT JOIN mascotas m ON c.id_mascota = m.id_mascota
            `;
        const queryParams = [];
        const { status } = req.query;

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

// Middleware de manejo de errores global (DEBE SER EL ÚLTIMO app.use)
app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);
    res.status(500).json({
        success: false,
        message: "Ocurrió un error inesperado en el servidor.",
        error: process.env.NODE_ENV === 'development' ? err.stack : err.message
    });
});
