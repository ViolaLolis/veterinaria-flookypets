// server.txt - Backend para Flooky Pets (Completo y Corregido)

// =============================================================================
// IMPORTS Y CONFIGURACIÓN INICIAL
// =============================================================================

// Módulos de Express y middleware
const express = require("express");
const cors = require("cors");
const fileUpload = require('express-fileupload'); // Para manejar la subida de archivos

// Módulos de base de datos y autenticación
const mysql = require("mysql2/promise"); // Cliente MySQL con soporte para promesas
const bcrypt = require("bcryptjs");     // Para hash de contraseñas
const jwt = require("jsonwebtoken");    // Para tokens de autenticación JWT

// Configuración de Cloudinary para gestión de imágenes
const cloudinary = require('cloudinary').v2;

// Carga de variables de entorno desde .env
require('dotenv').config();

// Inicialización de la aplicación Express
const app = express();
const PORT = process.env.PORT || 5000; // Puerto del servidor, por defecto 5000

// Configuración de Cloudinary: se obtienen las credenciales de las variables de entorno
// Si no están definidas, se usan valores por defecto (¡cambiar en producción!)
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dnemd9wp0';
const API_KEY = process.env.CLOUDINARY_API_KEY || '418626316652541';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'NKTrcFgCXc-SUX_HNu61chc-f4M';

// Aplica la configuración a Cloudinary
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

// --- DEBUGGING CLOUDINARY CONFIG ---
// Muestra la configuración de Cloudinary en la consola para depuración
console.log("Cloudinary Configured With:");
console.log("  Cloud Name:", CLOUD_NAME);
console.log("  API Key:", API_KEY);
console.log("  API Secret (first 5 chars):", API_SECRET ? API_SECRET.substring(0, 5) + '...' : 'N/A');
// ------------------------------------

// =============================================================================
// MIDDLEWARE GLOBAL
// =============================================================================

// Middleware CORS: Permite solicitudes desde el frontend
// Configurado para aceptar solicitudes desde el URL del frontend (o localhost:3000 por defecto)
// y permite el envío de credenciales (cookies, encabezados de autorización).
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Middleware para manejo de subida de archivos (express-fileupload)
// IMPORTANTE: DEBE ir antes de express.json() para que pueda procesar los archivos multipart/form-data
// Limita el tamaño de los archivos a 5MB y aborta la operación si se excede.
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB (5 * 1024 * 1024 bytes)
    abortOnLimit: true, // Abortar si se excede el límite
    debug: true // Habilitar logs de depuración para fileUpload
}));

// Middleware para parsear cuerpos de solicitud en formato JSON
// Ahora express.json() puede ir después de fileUpload
app.use(express.json()); // Habilita el parsing de JSON en el cuerpo de las peticiones

// =============================================================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// =============================================================================

// Configuración del pool de conexiones a la base de datos MySQL
// Utiliza variables de entorno para la configuración de la base de datos.
// Se usan valores por defecto para desarrollo local.
const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",       // Host de la base de datos
    user: process.env.DB_USER || "root",           // Usuario de la base de datos
    password: process.env.DB_PASSWORD || "12345678", // Contraseña de la base de datos
    database: process.env.DB_NAME || "veterinaria", // Nombre de la base de datos
    waitForConnections: true,                      // Esperar si no hay conexiones disponibles
    connectionLimit: 10,                           // Número máximo de conexiones en el pool
    queueLimit: 0                                  // Tamaño máximo de la cola para conexiones pendientes
});

// Verificar conexión a la base de datos al inicio del servidor
// Intenta obtener una conexión del pool para verificar que la configuración es correcta.
pool.getConnection()
    .then(conn => {
        console.log('Conectado a la base de datos MySQL');
        conn.release(); // Libera la conexión de vuelta al pool
    })
    .catch(err => {
        console.error('Error de conexión a la base de datos:', err);
        process.exit(1); // Termina el proceso si no se puede conectar a la BD
    });

// =============================================================================
// UTILIDADES Y FUNCIONES AUXILIARES
// =============================================================================

// Función para simular envío de correo electrónico
// En un entorno de producción, esto sería reemplazado por un servicio de envío de correos real (ej. SendGrid, Nodemailer).
const simulateSendEmail = (toEmail, subject, body) => {
    console.log(`--- SIMULANDO ENVÍO DE CORREO ---`);
    console.log(`Para: ${toEmail}`);
    console.log(`Asunto: ${subject}`);
    console.log(`Cuerpo: \n${body}`);
    console.log(`----------------------------------`);
};

// =============================================================================
// MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
// =============================================================================

// Middleware de autenticación JWT
// Verifica la validez del token JWT enviado en el encabezado 'Authorization'.
// Si el token es válido, decodifica la información del usuario y la adjunta a `req.user`.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token (Bearer <token>)

    if (!token) {
        console.log("Auth: No se proporcionó token.");
        return res.status(401).json({ success: false, message: "Acceso denegado. No se proporcionó token." });
    }

    // Verifica el token usando la clave secreta (desde .env o por defecto)
    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) {
            console.error("Auth: Error de verificación JWT:", err);
            // Si el token es inválido o ha expirado, devuelve 403 Forbidden.
            return res.status(403).json({ success: false, message: "Token inválido o expirado." });
        }
        // Adjunta la información del usuario (id, email, role) al objeto de solicitud.
        // Convierte el ID a entero para asegurar consistencia.
        req.user = { ...user, id: parseInt(user.id) };
        console.log("Auth: Usuario autenticado desde el token:", req.user.id, req.user.role);
        next(); // Pasa al siguiente middleware o manejador de ruta
    });
};
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        // Asegúrate de que req.user exista y contenga el rol,
        // ya que authenticateToken debería haberlo adjuntado.
        if (!req.user || !req.user.role) {
            console.log("Auth: No se encontró información de usuario en el token.");
            return res.status(403).json({ success: false, message: "Acceso denegado. Información de rol no disponible." });
        }

        // Verifica si el rol del usuario está incluido en los roles permitidos
        if (!allowedRoles.includes(req.user.role)) {
            console.log(`Auth: Acceso denegado. Rol '${req.user.role}' no autorizado. Roles permitidos: ${allowedRoles.join(', ')}`);
            return res.status(403).json({ success: false, message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.` });
        }
        next(); // Si el rol es válido, pasa al siguiente middleware/controlador de ruta
    };
};
// Middleware para verificar rol de administrador
// Solo permite el acceso si el usuario autenticado tiene el rol 'admin'.
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        console.log(`Auth: Acceso denegado. Rol ${req.user.role} no es administrador.`);
        return res.status(403).json({ success: false, message: "Acceso denegado. Se requiere rol de administrador." });
    }
    next();
};

// Middleware para verificar rol de veterinario o administrador
// Permite el acceso si el usuario autenticado tiene el rol 'veterinario' o 'admin'.
const isVetOrAdmin = (req, res, next) => {
    if (req.user.role !== 'veterinario' && req.user.role !== 'admin') {
        console.log(`Auth: Acceso denegado. Rol ${req.user.role} no es veterinario ni administrador.`);
        return res.status(403).json({ success: false, message: "Acceso denegado. Se requiere rol de veterinario o administrador." });
    }
    next();
};

// Middleware para verificar si es el propietario del recurso, un veterinario o un administrador
// Este middleware es crucial para la seguridad de los datos, asegurando que los usuarios solo
// puedan acceder o modificar sus propios recursos, a menos que sean administradores o veterinarios
// gestionando recursos relacionados con sus funciones.
const isOwnerOrAdmin = async (req, res, next) => {
    const userIdFromToken = req.user.id;
    const userRole = req.user.role;

    console.log(`[isOwnerOrAdmin START] User ID: ${userIdFromToken}, Role: ${userRole}, Original URL: ${req.originalUrl}, Path: ${req.path}, Method: ${req.method}`);

    // Administradores y Veterinarios siempre tienen acceso a los recursos que gestionan
    // (excepto eliminaciones de usuarios, que son solo para admin).
    if (userRole === 'admin' || userRole === 'veterinario') {
        console.log(`[isOwnerOrAdmin] ${userRole} access granted. Calling next().`);
        return next();
    }

    // Si el rol es 'usuario', solo puede acceder a sus propios recursos.
    try {
        // Lógica para rutas de mascotas
        if (req.originalUrl.startsWith('/mascotas')) {
            if (req.method === 'GET') {
                if (req.params.id) { // Mascota específica por ID: /mascotas/:id
                    const idMascota = parseInt(req.params.id);
                    if (isNaN(idMascota)) {
                        console.log("[isOwnerOrAdmin - /mascotas/:id GET] ID de mascota inválido.");
                        return res.status(400).json({ success: false, message: "ID de mascota no válido." });
                    }
                    const [rows] = await pool.query("SELECT id_propietario FROM mascotas WHERE id_mascota = ?", [idMascota]);
                    if (rows.length === 0) {
                        console.log(`[isOwnerOrAdmin - /mascotas/:id GET] Mascota con ID ${idMascota} no encontrada.`);
                        return res.status(404).json({ success: false, message: "Mascota no encontrada." });
                    }
                    const resourceOwnerId = rows[0].id_propietario;
                    if (resourceOwnerId !== userIdFromToken) {
                        console.log(`[isOwnerOrAdmin - /mascotas/:id GET] Denegado: Usuario ${userIdFromToken} intentó acceder a mascota de ${resourceOwnerId}.`);
                        return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver tus propias mascotas." });
                    }
                    return next(); // El propietario puede ver su propia mascota
                } else { // Lista de mascotas: /mascotas o /mascotas?id_propietario=X
                    const requestedOwnerId = parseInt(req.query.id_propietario);
                    if (userRole === 'usuario' && (isNaN(requestedOwnerId) || requestedOwnerId !== userIdFromToken)) {
                        console.log(`[isOwnerOrAdmin - /mascotas GET List] Denegado: Usuario ${userIdFromToken} intentó acceder a mascotas de ${requestedOwnerId || 'propietario no especificado/diferente'}.`);
                        return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver tus propias mascotas." });
                    }
                    return next();
                }
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
                    console.log("[isOwnerOrAdmin - /mascotas/:id PUT/DELETE] ID de mascota inválido.");
                    return res.status(400).json({ success: false, message: "ID de mascota no válido." });
                }
                const [rows] = await pool.query("SELECT id_propietario FROM mascotas WHERE id_mascota = ?", [idMascota]);
                if (rows.length === 0) {
                    console.log(`[isOwnerOrAdmin - /mascotas/:id PUT/DELETE] Mascota con ID ${idMascota} no encontrada.`);
                    return res.status(404).json({ success: false, message: "Mascota no encontrada." });
                }
                const resourceOwnerId = rows[0].id_propietario;
                if (resourceOwnerId !== userIdFromToken) {
                    console.log(`[isOwnerOrAdmin - /mascotas/:id PUT/DELETE] Denegado: Usuario ${userIdFromToken} intentó modificar/eliminar mascota de ${resourceOwnerId}.`);
                    return res.status(403).json({ success: false, message: "Acceso denegado. No eres el propietario de esta mascota." });
                }
                return next();
            }
        } else if (req.originalUrl.startsWith('/historial_medico')) {
            if (req.method === 'GET') {
                if (req.params.id) { // Registro de historial específico por ID: /historial_medico/:id
                    const idHistorial = parseInt(req.params.id);
                    if (isNaN(idHistorial)) {
                        console.log("[isOwnerOrAdmin - /historial_medico/:id GET] ID de historial médico inválido.");
                        return res.status(400).json({ success: false, message: "ID de historial médico no válido." });
                    }
                    const [rows] = await pool.query(
                        "SELECT m.id_propietario FROM historial_medico h JOIN mascotas m ON h.id_mascota = m.id_mascota WHERE h.id_historial = ?",
                        [idHistorial]
                    );
                    if (rows.length === 0) {
                        console.log(`[isOwnerOrAdmin - /historial_medico/:id GET] Historial médico con ID ${idHistorial} no encontrado.`);
                        return res.status(404).json({ success: false, message: "Historial médico no encontrado." });
                    }
                    const resourceOwnerId = rows[0].id_propietario;

                    if (resourceOwnerId !== userIdFromToken) {
                        console.log(`[isOwnerOrAdmin - /historial_medico/:id GET] Denegado: Usuario ${userIdFromToken} intentó acceder a historial médico de ${resourceOwnerId}.`);
                        return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver los historiales de tus propias mascotas." });
                    }
                    return next();
                } else if (req.query.id_mascota) { // Lista de historiales para una mascota específica: /historial_medico?id_mascota=X
                    const idMascota = parseInt(req.query.id_mascota);
                    if (isNaN(idMascota)) {
                        console.log("[isOwnerOrAdmin - /historial_medico?id_mascota GET] ID de mascota inválido.");
                        return res.status(400).json({ success: false, message: "ID de mascota no válido." });
                    }
                    const [rows] = await pool.query("SELECT id_propietario FROM mascotas WHERE id_mascota = ?", [idMascota]);
                    if (rows.length === 0) {
                        console.log(`[isOwnerOrAdmin - /historial_medico?id_mascota GET] Mascota con ID ${idMascota} no encontrada.`);
                        return res.status(404).json({ success: false, message: "Mascota no encontrada." });
                    }
                    const resourceOwnerId = rows[0].id_propietario;
                    if (resourceOwnerId !== userIdFromToken) {
                        console.log(`[isOwnerOrAdmin - /historial_medico?id_mascota GET] Denegado: Usuario ${userIdFromToken} intentó acceder a historiales de mascota de ${resourceOwnerId}.`);
                        return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver los historiales de tus propias mascotas." });
                    }
                    return next(); // El propietario puede ver los historiales médicos de su propia mascota
                }
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

                // Si el usuario no es ni el cliente ni el veterinario asignado, denegar el acceso.
                if (resourceClientId !== userIdFromToken && resourceVetId !== userIdFromToken) {
                    console.log(`[isOwnerOrAdmin - /citas/:id] Denegado: Usuario ${userIdFromToken} intentó acceder a cita de cliente ${resourceClientId} o veterinario ${resourceVetId}.`);
                    return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para ver/modificar esta cita." });
                }
                return next();
            }
            // Para POST /citas/agendar (crear cita)
            if (req.method === 'POST' && req.originalUrl === '/citas/agendar') { // Específico para /citas/agendar
                // La lógica de validación del propietario para la creación de citas
                // se maneja directamente en la ruta POST /citas/agendar.
                // Este middleware solo asegura que el usuario esté autenticado.
                return next();
            }
            // Para GET /citas (listar citas)
            if (req.method === 'GET') {
                // La lógica de filtrado por id_cliente o id_veterinario ya está en la ruta /citas.
                // Este middleware solo asegura que un usuario solo pueda ver sus propias citas si no es admin/vet.
                return next();
            }

        } else if (req.originalUrl.startsWith('/usuarios')) {
            const targetUserId = parseInt(req.params.id);
            if (isNaN(targetUserId)) {
                console.log("[isOwnerOrAdmin - /usuarios] ID de usuario inválido.");
                return res.status(400).json({ success: false, message: "ID de usuario no válido." });
            }
            // Permite al admin editar cualquier usuario, y al usuario editarse a sí mismo.
            if (userRole === 'admin' || targetUserId === userIdFromToken) {
                return next();
            }
            console.log(`[isOwnerOrAdmin - /usuarios] Denegado: Usuario ${userIdFromToken} intentó acceder al perfil de ${targetUserId}.`);
            return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver/modificar tu propio perfil." });

        } else if (req.originalUrl.startsWith('/api/notifications')) { // Actualizado para coincidir con la nueva ruta
            const notificationId = parseInt(req.params.notificationId); // Usa notificationId de los parámetros
            if (isNaN(notificationId)) {
                // Este caso maneja /api/notifications/veterinarian/:veterinarianId
                // La verificación para /api/notifications/veterinarian/:veterinarianId se realiza dentro de la propia ruta.
                // Para otras rutas de notificación que puedan tener un ID en los parámetros, esto se aplicará.
                if (req.originalUrl.includes('/veterinarian/')) {
                    return next(); // Deja que la ruta específica del veterinario maneje su propia validación de ID
                }
                console.log("[isOwnerOrAdmin - /api/notifications] ID de notificación inválido.");
                return res.status(400).json({ success: false, message: "ID de notificación no válido." });
            }
            const [rows] = await pool.query("SELECT id_usuario FROM notificaciones WHERE id_notificacion = ?", [notificationId]); // Cambiado el nombre de la tabla aquí
            if (rows.length === 0) {
                console.log(`[isOwnerOrAdmin - /api/notifications] Notificación con ID ${notificationId} no encontrada.`);
                return res.status(404).json({ success: false, message: "Notificación no encontrada." });
            }
            const resourceOwnerId = rows[0].id_usuario;
            if (resourceOwnerId !== userIdFromToken) {
                console.log(`[isOwnerOrAdmin - /api/notifications] Denegado: Usuario ${userIdFromToken} intentó acceder a notificación de ${resourceOwnerId}.`);
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


// =============================================================================
// RUTAS DE PRUEBA
// =============================================================================

// Ruta de prueba simple para verificar que el servidor está funcionando
app.get("/", (req, res) => {
    res.send("Servidor de veterinaria funcionando correctamente");
});

// =============================================================================
// RUTAS DE AUTENTICACIÓN
// =============================================================================

// Ruta para el inicio de sesión de usuarios
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Received login request for email:", email); // Log de depuración

    try {
        // Busca al usuario por email en la base de datos
        const [users] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);

        if (users.length === 0) {
            console.log("Login failed: User not found for email:", email); // Log de depuración
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const user = users[0];
        // Compara la contraseña proporcionada con la contraseña hasheada en la BD
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("Login failed: Password mismatch for email:", email); // Log de depuración
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Si las credenciales son correctas, crea un token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key', // Clave secreta para firmar el token
            { expiresIn: '24h' } // El token expira en 24 horas
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
        console.log("Login successful for user:", user.email); // Log de depuración

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// Ruta de registro para usuarios normales (rol 'usuario' por defecto)
app.post("/register", async (req, res) => {
    const { nombre, apellido, email, password, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento } = req.body;

    // Validación básica de campos requeridos
    if (!email || !password || !nombre || !telefono) {
        return res.status(400).json({ message: "Datos incompletos" });
    }

    console.log("[REGISTER] Received data:", req.body); // Log de depuración

    try {
        // Verificar si el usuario ya existe por email para evitar duplicados
        const [existingUsers] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "El email ya está registrado" }); // Mensaje específico para conflicto
        }

        // Hash de la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario con rol 'usuario' por defecto
        const [result] = await pool.query(
            `INSERT INTO usuarios
            (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role)
            VALUES (UPPER(TRIM(?)), ?, UPPER(TRIM(?)), UPPER(TRIM(?)), TRIM(?), UPPER(TRIM(?)), UPPER(TRIM(?)), UPPER(TRIM(?)), ?, 'usuario')`,
            [email, hashedPassword, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento]
        );

        // Responde con los datos del nuevo usuario (sin la contraseña)
        res.status(201).json({
            id: result.insertId,
            email,
            nombre,
            apellido,
            role: 'usuario'
        });
        console.log("[REGISTER] User registered successfully:", email); // Log de depuración

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ message: "Error al registrar usuario", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Ruta para recuperación de contraseña (generación de token de un solo uso)
app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    console.log("Received forgot-password request for email:", email); // Log de depuración

    try {
        // Busca al usuario por email
        const [users] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (users.length === 0) {
            console.log("Forgot password failed: User not found for email:", email); // Log de depuración
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Generar un token de recuperación numérico de 6 dígitos
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpires = new Date(Date.now() + 3600000); // Token expira en 1 hora (3600000 ms)

        // Almacena el token y su fecha de expiración en la base de datos
        await pool.query(
            "UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
            [resetToken, resetTokenExpires, email]
        );

        res.json({
            success: true,
            message: "Token de recuperación generado",
            resetToken: resetToken // En un entorno real, este token se enviaría por correo electrónico.
        });
        console.log("Forgot password successful for email:", email, "Token:", resetToken); // Log de depuración

    } catch (error) {
        console.error("Error en forgot-password:", error);
        res.status(500).json({
            success: false,
            message: "Error en el servidor",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// Ruta para verificar el código de recuperación de contraseña
app.post("/verify-reset-code", async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token) {
        return res.status(400).json({
            success: false,
            message: "Email y token son requeridos"
        });
    }

    try {
        // Busca al usuario por email
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

        // Verifica que el token proporcionado coincida con el almacenado
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

// Ruta para resetear la contraseña del usuario
app.post("/reset-password", async (req, res) => {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son requeridos"
        });
    }

    try {
        // Busca al usuario con el email y un token de recuperación válido y no expirado
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

        // Hashea la nueva contraseña
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

// =============================================================================
// RUTAS DE CLOUDINARY (Subida de Imágenes)
// =============================================================================

// Ruta para subir imágenes a Cloudinary
// Esta ruta no necesita express.json() porque fileUpload ya maneja el cuerpo de la solicitud (multipart/form-data).
app.post('/upload-image', authenticateToken, async (req, res) => {
    try {
        console.log("Received upload request. Files:", req.files);
        // Verifica si se ha subido un archivo y si el campo 'image' existe.
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.image) {
            return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo o el campo "image" está vacío.' });
        }

        const file = req.files.image;
        console.log("File received:", file.name, file.mimetype, file.size);

        const uploadOptions = {};
        if (file.tempFilePath) {
            // Si express-fileupload usa archivos temporales (useTempFiles: true en la configuración)
            uploadOptions.file = file.tempFilePath;
        } else if (file.data) {
            // Si express-fileupload maneja el archivo en memoria (useTempFiles: false o por defecto para archivos pequeños)
            // Cloudinary puede subir desde un Buffer directamente si se le pasa como data URI
            uploadOptions.file = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
        } else {
            return res.status(500).json({ success: false, message: 'No se pudo acceder al archivo subido (ni tempFilePath ni data).' });
        }

        // Sube el archivo a Cloudinary
        const result = await cloudinary.uploader.upload(uploadOptions.file, {
            folder: 'flookypets_profiles', // Carpeta en Cloudinary donde se guardarán las imágenes
        });

        // Si se usaron archivos temporales, eliminarlos después de subir para liberar espacio.
        if (file.tempFilePath) {
            const fs = require('fs'); // Importar 'fs' solo si es necesario (para operaciones de sistema de archivos)
            fs.unlink(file.tempFilePath, (err) => {
                if (err) console.error("Error al eliminar archivo temporal:", err);
            });
        }

        // Responde con el URL seguro de la imagen subida
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


// =============================================================================
// RUTAS DEL PANEL DE ADMINISTRADOR
// =============================================================================

/**
 * OBTENER ESTADÍSTICAS PARA EL DASHBOARD DE ADMINISTRADOR
 * GET /admin/stats
 * Requiere autenticación y rol de administrador.
 */
app.get("/admin/stats", authenticateToken, isAdmin, async (req, res) => {
    try {
        // Obtener el conteo total de usuarios (rol 'usuario')
        const [[{ totalUsers }]] = await pool.query(
            "SELECT COUNT(*) as totalUsers FROM usuarios WHERE role = 'usuario'"
        );

        // Obtener el conteo total de veterinarios
        const [[{ totalVets }]] = await pool.query(
            "SELECT COUNT(*) as totalVets FROM usuarios WHERE role = 'veterinario'"
        );

        // Obtener el conteo total de administradores
        const [[{ totalAdmins }]] = await pool.query(
            "SELECT COUNT(*) as totalAdmins FROM usuarios WHERE role = 'admin'"
        );

        // Obtener el conteo total de servicios
        const [[{ totalServices }]] = await pool.query(
            "SELECT COUNT(*) as totalServices FROM servicios"
        );

        // Obtener el conteo de citas para el mes actual
        const [[{ totalAppointments }]] = await pool.query(
            "SELECT COUNT(*) as totalAppointments FROM citas WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE())"
        );

        // Obtener el conteo de citas para el mes anterior (para calcular el crecimiento)
        const [[{ lastMonthAppointments }]] = await pool.query(
            "SELECT COUNT(*) as lastMonthAppointments FROM citas WHERE MONTH(fecha) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(fecha) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)"
        );

        // Calcular el crecimiento mensual de citas
        const growth = lastMonthAppointments > 0
            ? ((totalAppointments - lastMonthAppointments) / lastMonthAppointments * 100).toFixed(2)
            : (totalAppointments > 0 ? 100 : 0); // Si no había citas el mes pasado pero hay ahora, el crecimiento es 100% (o 0 si no hay ninguna)

        res.json({
            success: true,
            data: {
                totalUsers,
                totalVets,
                totalAdmins,
                totalServices,
                totalAppointments,
                monthlyGrowth: parseFloat(growth) // Asegura que se envíe como número
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
 * Requiere autenticación y rol de administrador.
 */
app.get("/api/stats/citas-por-mes", authenticateToken, isAdmin, async (req, res) => {
    try {
        // Consulta para obtener el conteo de citas por mes, limitado a los últimos 12 meses.
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
 * Requiere autenticación y rol de administrador.
 */
app.get("/api/stats/servicios-populares", authenticateToken, isAdmin, async (req, res) => {
    try {
        // Consulta para obtener los 5 servicios más populares basados en el número de citas.
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

/**
 * NUEVO ENDPOINT: OBTENER CONFIGURACIONES DEL ADMINISTRADOR
 * GET /admin/settings
 * (Implementación básica para evitar el error 404 en el frontend)
 * Requiere autenticación y rol de administrador.
 */
app.get("/admin/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
        // En una aplicación real, aquí cargarías configuraciones desde la base de datos
        // o un archivo de configuración. Por ahora, devolvemos un objeto vacío o con datos de ejemplo.
        res.json({
            success: true,
            data: {
                // Ejemplo de configuración:
                // email_notifications_enabled: true,
                // default_appointment_duration: 30,
                // clinic_name: "Flooky Pets Clinic"
            },
            message: "Configuraciones obtenidas correctamente (implementación básica)."
        });
    } catch (error) {
        console.error("Error al obtener configuraciones de admin:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener configuraciones de admin",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});


// ### **GESTIÓN DE ADMINISTRADORES**
// Rutas para que los administradores gestionen otros administradores (crear, leer, actualizar, eliminar).

// Obtener todos los administradores
app.get("/api/admin/administrators", authenticateToken, isAdmin, async (req, res) => {
    try {
        // Selecciona todos los usuarios con rol 'admin', excluyendo la contraseña
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
app.post("/api/admin/administrators", authenticateToken, isAdmin, async (req, res) => {
    let requestBody = req.body; // Usa let para permitir reasignación

    // WORKAROUND: Si express.json() falló al parsear (porque recibió un JSON doblemente stringificado),
    // req.body podría estar vacío o no ser un objeto. Necesitamos re-leer el stream del cuerpo crudo.
    if (typeof requestBody !== 'object' || requestBody === null || Object.keys(requestBody).length === 0) {
        let rawData = '';
        await new Promise((resolve, reject) => {
            req.on('data', chunk => {
                rawData += chunk;
            });
            req.on('end', () => {
                resolve();
            });
            req.on('error', err => {
                reject(err);
            });
        });

        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            try {
                // Intenta parsear el rawData dos veces
                requestBody = JSON.parse(JSON.parse(rawData));
                console.warn("WORKAROUND: JSON doblemente stringificado detectado y re-parseado en la ruta POST /api/admin/administrators.");
            } catch (parseError) {
                console.error("WORKAROUND FALLÓ: No se pudo re-parsear JSON doblemente stringificado en la ruta POST /api/admin/administrators.", parseError);
                return res.status(400).json({ success: false, message: "Datos de solicitud inválidos o corruptos." });
            }
        } else {
            // Si no está doblemente stringificado, pero express.json() aún falló,
            // es probable que esté realmente malformado o vacío.
            console.error("El cuerpo de la solicitud no es un objeto y no es JSON doblemente stringificado. Datos crudos:", rawData);
            return res.status(400).json({ success: false, message: "Datos de solicitud inválidos." });
        }
    }

    // Ahora, extrae las propiedades de requestBody
    const { nombre, apellido, email, telefono, direccion, password } = requestBody;

    // Validación mejorada de campos requeridos y longitud de contraseña
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
    console.log("[ADMIN_REGISTER_ADMIN] Received data:", requestBody); // Log de depuración

    try {
        // Verificar si el email ya existe para evitar duplicados
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

        // Hashea la contraseña antes de insertarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo administrador con rol 'admin'
        const [result] = await pool.query(
            `INSERT INTO usuarios
            (nombre, apellido, email, telefono, direccion, password, role)
            VALUES (UPPER(TRIM(?)), UPPER(TRIM(?)), UPPER(TRIM(?)), TRIM(?), UPPER(TRIM(?)), ?, 'admin')`, // Aplica UPPER y TRIM para estandarizar datos
            [nombre, apellido, email, telefono, direccion, hashedPassword]
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
        console.log("[ADMIN_REGISTER_ADMIN] Admin registered successfully:", email); // Log de depuración

    } catch (error) {
        console.error("Error al crear administrador:", error);
        res.status(500).json({
            success: false,
            message: "Error al crear administrador",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// Actualizar administrador existente
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
    console.log("[ADMIN_UPDATE_ADMIN] Received data:", req.body, "for ID:", id); // Log de depuración

    try {
        // Un administrador no debería poder modificarse a sí mismo desde este panel (debe usar su perfil)
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Usa la sección de perfil para modificar tus propios datos"
            });
        }

        // Verificar que el administrador a actualizar existe y tiene el rol correcto
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

        // Construir la consulta de actualización dinámicamente para solo actualizar campos presentes
        const fields = [];
        const values = [];
        if (nombre !== undefined) { fields.push('nombre = UPPER(TRIM(?))'); values.push(nombre); } // Aplica UPPER y TRIM
        if (apellido !== undefined) { fields.push('apellido = UPPER(TRIM(?))'); values.push(apellido); } // Aplica UPPER y TRIM
        if (telefono !== undefined) { fields.push('telefono = TRIM(?)'); values.push(telefono); } // Aplica TRIM
        if (direccion !== undefined) { fields.push('direccion = UPPER(TRIM(?))'); values.push(direccion); } // Aplica UPPER y TRIM


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
        console.log("[ADMIN_UPDATE_ADMIN] Admin updated successfully:", id); // Log de depuración

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
    console.log("[ADMIN_DELETE_ADMIN] Deleting admin with ID:", id); // Log de depuración

    try {
        // Evitar que un administrador se elimine a sí mismo
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({
                success: false,
                message: "No puedes eliminarte a ti mismo"
            });
        }

        // Verificar si el administrador tiene citas asignadas (clave foránea)
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

        // Verificar si el administrador tiene historiales médicos asociados (clave foránea)
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

        // Eliminar el administrador de la base de datos
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
        console.log("[ADMIN_DELETE_ADMIN] Admin deleted successfully:", id); // Log de depuración

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
// Rutas para que los administradores gestionen a los veterinarios.
// La ruta GET /usuarios/veterinarios también es accesible para usuarios normales para seleccionar un veterinario al agendar una cita.

// Obtener todos los veterinarios
// MODIFICADO: Se eliminó el middleware isVetOrAdmin para permitir que usuarios regulares accedan a esta lista para agendar citas.
app.get("/usuarios/veterinarios", authenticateToken, async (req, res) => {
    try {
        // Selecciona todos los usuarios con rol 'veterinario', excluyendo la contraseña
        const [vets] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion, active, imagen_url, created_at, experiencia, universidad, horario FROM usuarios WHERE role = 'veterinario'"
        );
        res.json({ success: true, data: vets });
    } catch (error) {
        console.error("Error al obtener veterinarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener veterinarios", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Crear nuevo veterinario
app.post("/usuarios/veterinarios", authenticateToken, isAdmin, async (req, res) => {
    let requestBody = req.body; // Usa let para permitir reasignación

    // WORKAROUND: Si express.json() falló al parsear (porque recibió un JSON doblemente stringificado),
    // req.body podría estar vacío o no ser un objeto. Necesitamos re-leer el stream del cuerpo crudo.
    if (typeof requestBody !== 'object' || requestBody === null || Object.keys(requestBody).length === 0) {
        let rawData = '';
        await new Promise((resolve, reject) => {
            req.on('data', chunk => {
                rawData += chunk;
            });
            req.on('end', () => {
                resolve();
            });
            req.on('error', err => {
                reject(err);
            });
        });

        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            try {
                // Intenta parsear el rawData dos veces
                requestBody = JSON.parse(JSON.parse(rawData));
                console.warn("WORKAROUND: JSON doblemente stringificado detectado y re-parseado en la ruta POST /usuarios/veterinarios.");
            } catch (parseError) {
                console.error("WORKAROUND FALLÓ: No se pudo re-parsear JSON doblemente stringificado en la ruta POST /usuarios/veterinarios.", parseError);
                return res.status(400).json({ success: false, message: "Datos de solicitud inválidos o corruptos." });
            }
        } else {
            // Si no está doblemente stringificado, pero express.json() aún falló,
            // es probable que esté realmente malformado o vacío.
            console.error("El cuerpo de la solicitud no es un objeto y no es JSON doblemente stringificado. Datos crudos:", rawData);
            return res.status(400).json({ success: false, message: "Datos de solicitud inválidos." });
        }
    }

    // Ahora, extrae las propiedades de requestBody
    const { nombre, apellido, email, telefono, direccion, password, experiencia, universidad, horario } = requestBody;

    // Validación de campos requeridos
    if (!nombre || !email || !password || !telefono || !experiencia || !universidad || !horario) {
        return res.status(400).json({ success: false, message: "Nombre, email, teléfono, contraseña, experiencia, universidad y horario son requeridos" });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 6 caracteres" });
    }
    console.log("[ADMIN_REGISTER_VET] Received data (after workaround):", requestBody); // Log de depuración

    try {
        // Verificar si el email ya existe
        const [existing] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "El email ya está registrado" });
        }

        // Hashea la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo veterinario con rol 'veterinario'
        const [result] = await pool.query(
            `INSERT INTO usuarios
            (nombre, apellido, email, telefono, direccion, password, role, experiencia, universidad, horario)
            VALUES (UPPER(TRIM(?)), UPPER(TRIM(?)), UPPER(TRIM(?)), TRIM(?), UPPER(TRIM(?)), ?, 'veterinario', ?, ?, ?)`, // Aplica UPPER y TRIM
            [nombre, apellido, email, telefono, direccion, hashedPassword, experiencia, universidad, horario]
        );

        // Obtener el veterinario recién creado para devolverlo en la respuesta
        const [newVet] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion, active, imagen_url, created_at, experiencia, universidad, horario FROM usuarios WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({ success: true, message: "Veterinario creado correctamente", data: newVet[0] });
        console.log("[ADMIN_REGISTER_VET] Vet registered successfully:", email); // Log de depuración

    } catch (error) {
        console.error("Error al crear veterinario:", error);
        res.status(500).json({ success: false, message: "Error al crear veterinario", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar veterinario
app.put("/usuarios/veterinarios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion, active, experiencia, universidad, horario } = req.body;

    // Validación básica
    if (!nombre || !telefono || !experiencia || !universidad || !horario) {
        return res.status(400).json({ success: false, message: "Nombre, teléfono, experiencia, universidad y horario son requeridos" });
    }
    console.log("[ADMIN_UPDATE_VET] Received data:", req.body, "for ID:", id); // Log de depuración

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
        if (nombre !== undefined) { fields.push('nombre = UPPER(TRIM(?))'); values.push(nombre); } // Aplica UPPER y TRIM
        if (apellido !== undefined) { fields.push('apellido = UPPER(TRIM(?))'); values.push(apellido); } // Aplica UPPER y TRIM
        if (telefono !== undefined) { fields.push('telefono = TRIM(?)'); values.push(telefono); } // Aplica TRIM
        if (direccion !== undefined) { fields.push('direccion = UPPER(TRIM(?))'); values.push(direccion); } // Aplica UPPER y TRIM
        if (active !== undefined) { fields.push('active = ?'); values.push(active ? 1 : 0); } // Convierte booleano a 0/1
        if (experiencia !== undefined) { fields.push('experiencia = ?'); values.push(experiencia); }
        if (universidad !== undefined) { fields.push('universidad = ?'); values.push(universidad); }
        if (horario !== undefined) { fields.push('horario = ?'); values.push(horario); }


        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "No hay datos para actualizar." });
        }

        const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ? AND role = 'veterinario'`;
        values.push(id);

        await pool.query(query, values);

        // Obtener el veterinario actualizado para devolverlo en la respuesta
        const [updatedVet] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion, active, imagen_url, created_at, experiencia, universidad, horario FROM usuarios WHERE id = ?",
            [id]
        );

        res.json({ success: true, message: "Veterinario actualizado correctamente", data: updatedVet[0] });
        console.log("[ADMIN_UPDATE_VET] Vet updated successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al actualizar veterinario:", error);
        res.status(500).json({ success: false, message: "Error al actualizar veterinario", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar veterinario
app.delete("/usuarios/veterinarios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    console.log("[ADMIN_DELETE_VET] Deleting vet with ID:", id); // Log de depuración

    try {
        // Verificar si el veterinario tiene citas asignadas (clave foránea)
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

        // Verificar si el veterinario tiene historiales médicos asociados (clave foránea)
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

        // Eliminar el veterinario de la base de datos
        const [result] = await pool.query(
            "DELETE FROM usuarios WHERE id = ? AND role = 'veterinario'",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Veterinario no encontrado" });
        }

        res.json({ success: true, message: "Veterinario eliminado correctamente" });
        console.log("[ADMIN_DELETE_VET] Vet deleted successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al eliminar veterinario:", error);

        // Manejo específico para errores de clave foránea
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
// Rutas para que los administradores gestionen los servicios ofrecidos por la clínica.

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

// NUEVA RUTA: Obtener un servicio por ID
app.get("/servicios/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [service] = await pool.query("SELECT * FROM servicios WHERE id_servicio = ?", [id]);
        if (service.length === 0) {
            return res.status(404).json({ success: false, message: "Servicio no encontrado." });
        }
        res.json({ success: true, data: service[0] });
    } catch (error) {
        console.error(`Error al obtener servicio ${id}:`, error);
        res.status(500).json({ success: false, message: "Error al obtener servicio.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// Crear nuevo servicio
app.post("/servicios", authenticateToken, isAdmin, async (req, res) => {
    let requestBody = req.body; // Usa let para permitir reasignación

    // WORKAROUND: Si express.json() falló al parsear (porque recibió un JSON doblemente stringificado),
    // req.body podría estar vacío o no ser un objeto. Necesitamos re-leer el stream del cuerpo crudo.
    if (typeof requestBody !== 'object' || requestBody === null || Object.keys(requestBody).length === 0) {
        let rawData = '';
        await new Promise((resolve, reject) => {
            req.on('data', chunk => {
                rawData += chunk;
            });
            req.on('end', () => {
                resolve();
            });
            req.on('error', err => {
                reject(err);
            });
        });

        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            try {
                // Intenta parsear el rawData dos veces
                requestBody = JSON.parse(JSON.parse(rawData));
                console.warn("WORKAROUND: JSON doblemente stringificado detectado y re-parseado en la ruta POST /servicios.");
            } catch (parseError) {
                console.error("WORKAROUND FALLÓ: No se pudo re-parsear JSON doblemente stringificado en la ruta POST /servicios.", parseError);
                return res.status(400).json({ success: false, message: "Datos de solicitud inválidos o corruptos." });
            }
        } else {
            // Si no está doblemente stringificado, pero express.json() aún falló,
            // es probable que esté realmente malformado o vacío.
            console.error("El cuerpo de la solicitud no es un objeto y no es JSON doblemente stringificado. Datos crudos:", rawData);
            return res.status(400).json({ success: false, message: "Datos de solicitud inválidos." });
        }
    }

    // Ahora, extrae las propiedades de requestBody
    const { nombre, descripcion, precio } = requestBody;

    if (!nombre || !descripcion || !precio) {
        return res.status(400).json({ success: false, message: "Todos los campos son requeridos" });
    }
    console.log("[ADMIN_CREATE_SERVICE] Received data (after workaround):", requestBody); // Log de depuración

    try {
        const [result] = await pool.query(
            "INSERT INTO servicios (nombre, descripcion, precio) VALUES (UPPER(TRIM(?)), ?, ?)", // Aplica UPPER y TRIM
            [nombre, descripcion, precio]
        );

        // Obtener el servicio recién creado para devolverlo en la respuesta
        const [newService] = await pool.query(
            "SELECT * FROM servicios WHERE id_servicio = ?",
            [result.insertId]
        );

        res.status(201).json({ success: true, message: "Servicio creado correctamente", data: newService[0] });
        console.log("[ADMIN_CREATE_SERVICE] Service created successfully:", nombre); // Log de depuración

    } catch (error) {
        console.error("Error al crear servicio:", error);
        res.status(500).json({ success: false, message: "Error al crear servicio", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar servicio
app.put("/servicios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    console.log("[ADMIN_UPDATE_SERVICE] Received data:", req.body, "for ID:", id); // Log de depuración

    try {
        await pool.query(
            "UPDATE servicios SET nombre = UPPER(TRIM(?)), descripcion = ?, precio = ? WHERE id_servicio = ?", // Aplica UPPER y TRIM
            [nombre, descripcion, precio, id]
        );

        // Obtener el servicio actualizado para devolverlo en la respuesta
        const [updatedService] = await pool.query(
            "SELECT * FROM servicios WHERE id_servicio = ?",
            [id]
        );

        res.json({ success: true, message: "Servicio actualizado correctamente", data: updatedService[0] });
        console.log("[ADMIN_UPDATE_SERVICE] Service updated successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al actualizar servicio:", error);
        res.status(500).json({ success: false, message: "Error al actualizar servicio", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar servicio
app.delete("/servicios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    console.log("[ADMIN_DELETE_SERVICE] Deleting service with ID:", id); // Log de depuración

    try {
        // Primero, verificar si el servicio está asociado a alguna cita
        const [citasCount] = await pool.query(
            "SELECT COUNT(*) as count FROM citas WHERE id_servicio = ?",
            [id]
        );

        if (citasCount[0].count > 0) {
            // Si hay citas asociadas, no permitir la eliminación y enviar un mensaje específico
            return res.status(400).json({
                success: false,
                message: "No se puede eliminar el servicio porque está asociado a citas existentes. Por favor, elimina o modifica las citas que usan este servicio primero."
            });
        }

        // Si no hay citas asociadas, proceder con la eliminación del servicio
        const [result] = await pool.query("DELETE FROM servicios WHERE id_servicio = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Servicio no encontrado." });
        }

        res.json({ success: true, message: "Servicio eliminado correctamente" });
        console.log("[ADMIN_DELETE_SERVICE] Service deleted successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al eliminar servicio:", error);
        // Manejo genérico de otros errores del servidor
        res.status(500).json({ success: false, message: "Error al eliminar servicio", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// =============================================================================
// RUTAS DE GESTIÓN DE USUARIOS (REGULARES/CLIENTES)
// =============================================================================

// Obtener todos los usuarios con rol 'usuario' (para la tabla de AdminUsers)
app.get("/admin/usuarios", authenticateToken, isAdmin, async (req, res) => {
    try {
        // Consulta para obtener usuarios con rol 'usuario' y el conteo de sus mascotas.
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

// NUEVA RUTA: Obtener todos los usuarios con rol 'usuario' (para veterinarios y administradores)
// Utilizada en el formulario de citas para seleccionar un cliente.
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
        // Obtener datos básicos del usuario
        const [users] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento,
                    fecha_nacimiento, role, active, created_at, experiencia, universidad, horario, imagen_url,
                    notificaciones_activas, sonido_notificacion, recordatorios_cita, intervalo_recordatorio
             FROM usuarios
             WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }
        let user = users[0];

        // Obtener el conteo de mascotas registradas para este usuario
        const [[{ num_mascotas }]] = await pool.query(
            "SELECT COUNT(*) as num_mascotas FROM mascotas WHERE id_propietario = ?",
            [id]
        );
        user.mascotasRegistradas = num_mascotas;

        // Obtener el conteo de citas completadas para este usuario
        const [[{ citas_realizadas }]] = await pool.query(
            "SELECT COUNT(*) as citas_realizadas FROM citas WHERE id_cliente = ? AND estado = 'COMPLETA'",
            [id]
        );
        user.citasRealizadas = citas_realizadas;

        res.json({ success: true, data: user });
    } catch (error) {
        console.error(`Error al obtener usuario ${id}:`, error);
        res.status(500).json({ success: false, message: "Error al obtener datos del usuario.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar usuario (general, para clientes, veterinarios, admins)
app.put("/usuarios/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    const {
        nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento,
        fecha_nacimiento, active, password, experiencia, universidad, horario, imagen_url,
        notificaciones_activas, sonido_notificacion, recordatorios_cita, intervalo_recordatorio
    } = req.body;
    console.log("[UPDATE_USER] Received data:", req.body, "for ID:", id); // Log de depuración

    try {
        const fields = [];
        const values = [];

        // Construye la consulta de actualización dinámicamente
        if (nombre !== undefined) { fields.push('nombre = UPPER(TRIM(?))'); values.push(nombre); } // Aplica UPPER y TRIM
        if (apellido !== undefined) { fields.push('apellido = UPPER(TRIM(?))'); values.push(apellido); } // Aplica UPPER y TRIM

        if (email !== undefined) {
            // Verifica si el nuevo email ya está en uso por otro usuario
            const [existing] = await pool.query(
                "SELECT id FROM usuarios WHERE email = ? AND id != ?",
                [email, id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: "El email ya está en uso por otro usuario." });
            }
            fields.push('email = UPPER(TRIM(?))'); values.push(email); // Aplica UPPER y TRIM
        }

        if (telefono !== undefined) { fields.push('telefono = TRIM(?)'); values.push(telefono); } // Aplica TRIM
        if (direccion !== undefined) { fields.push('direccion = UPPER(TRIM(?))'); values.push(direccion); } // Aplica UPPER y TRIM
        if (tipo_documento !== undefined) { fields.push('tipo_documento = UPPER(TRIM(?))'); values.push(tipo_documento); } // Aplica UPPER y TRIM
        if (numero_documento !== undefined) { fields.push('numero_documento = UPPER(TRIM(?))'); values.push(numero_documento); } // Aplica UPPER y TRIM
        if (fecha_nacimiento !== undefined) { fields.push('fecha_nacimiento = ?'); values.push(fecha_nacimiento); }

        // 'active' solo puede ser cambiado por un admin o el propio usuario (si se le permite desactivar su cuenta)
        if (active !== undefined && (req.user.role === 'admin' || (req.user.id === parseInt(id)))) {
            fields.push('active = ?'); values.push(active ? 1 : 0);
        }

        // Si se proporciona una nueva contraseña, hashearla
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push('password = ?'); values.push(hashedPassword);
        }

        // Campos específicos de veterinario, solo actualizables por admin o el propio veterinario
        if (req.user.role === 'admin' || (req.user.role === 'veterinario' && req.user.id === parseInt(id))) {
            if (experiencia !== undefined) { fields.push('experiencia = ?'); values.push(experiencia); }
            if (universidad !== undefined) { fields.push('universidad = ?'); values.push(universidad); }
            if (horario !== undefined) { fields.push('horario = ?'); values.push(horario); }
        } else { // Si no es admin o el propio veterinario, asegurar que estos campos sean NULL si se intenta modificar
            if (experiencia !== undefined) { fields.push('experiencia = NULL'); }
            if (universidad !== undefined) { fields.push('universidad = NULL'); }
            if (horario !== undefined) { fields.push('horario = NULL'); }
        }

        // La imagen_url puede venir en el body si no se cambió el archivo, o se actualizó con la URL de Cloudinary
        if (imagen_url !== undefined) { fields.push('imagen_url = ?'); values.push(imagen_url); }

        // Campos de configuración de notificaciones del usuario
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

        // Obtener el usuario actualizado para devolverlo en la respuesta
        const [updatedUser] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, tipo_documento, numero_documento,
                    fecha_nacimiento, role, active, created_at, experiencia, universidad, horario, imagen_url,
                    notificaciones_activas, sonido_notificacion, recordatorios_cita, intervalo_recordatorio
             FROM usuarios WHERE id = ?`,
            [id]
        );

        res.json({ success: true, message: "Usuario actualizado correctamente.", data: updatedUser[0] });
        console.log("[UPDATE_USER] User updated successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ success: false, message: "Error al actualizar usuario.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// Eliminar usuario y datos relacionados (solo para administradores)
app.delete("/usuarios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    console.log("[DELETE_USER] Deleting user with ID:", id); // Log de depuración

    try {
        // Eliminar registros de historial médico asociados a las mascotas del usuario
        const [mascotas] = await pool.query("SELECT id_mascota FROM mascotas WHERE id_propietario = ?", [id]);
        if (mascotas.length > 0) {
            const mascotaIds = mascotas.map(m => m.id_mascota);
            await pool.query("DELETE FROM historial_medico WHERE id_mascota IN (?)", [mascotaIds]);
        }

        // Eliminar citas asociadas al usuario (como cliente)
        await pool.query("DELETE FROM citas WHERE id_cliente = ?", [id]);

        // Eliminar mascotas del usuario
        await pool.query("DELETE FROM mascotas WHERE id_propietario = ?", [id]);

        // Finalmente, eliminar el usuario
        const [result] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        res.json({ success: true, message: "Usuario y sus datos asociados eliminados correctamente." });
        console.log("[DELETE_USER] User deleted successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ success: false, message: "Error al eliminar usuario.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// =============================================================================
// RUTAS DE GESTIÓN DE MASCOTAS
// =============================================================================

// Obtener todas las mascotas (filtradas por propietario si el rol es 'usuario')
app.get("/mascotas", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    try {
        const { id_propietario } = req.query;
        let query = `SELECT m.*, CONCAT(u.nombre, ' ', u.apellido) as propietario_nombre,
                            u.apellido as propietario_apellido
                     FROM mascotas m
                     JOIN usuarios u ON m.id_propietario = u.id`;
        const queryParams = [];
        const conditions = [];

        // Si el usuario autenticado es un 'usuario' normal, solo puede ver sus propias mascotas.
        if (req.user.role === 'usuario') {
            conditions.push(`m.id_propietario = ?`);
            queryParams.push(req.user.id);
        } else if (id_propietario) { // Si es admin/vet, puede filtrar por id_propietario
            conditions.push(`m.id_propietario = ?`);
            queryParams.push(id_propietario);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
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

// Registrar nueva mascota (solo para veterinarios o admins)
app.post("/mascotas", authenticateToken, isVetOrAdmin, async (req, res) => {
    const { nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario, imagen_url } = req.body;

    if (!nombre || !especie || !id_propietario) {
        return res.status(400).json({ success: false, message: "Nombre, especie y ID de propietario son requeridos." });
    }
    console.log("[CREATE_PET] Received data:", req.body); // Log de depuración

    try {
        // Verificar que el propietario exista y sea un usuario regular
        const [owner] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'usuario'", [id_propietario]);
        if (owner.length === 0) {
            return res.status(400).json({ success: false, message: "ID de propietario no válido." });
        }

        const [result] = await pool.query(
            `INSERT INTO mascotas (nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario, imagen_url)
             VALUES (UPPER(TRIM(?)), UPPER(TRIM(?)), UPPER(TRIM(?)), ?, ?, UPPER(TRIM(?)), UPPER(TRIM(?)), UPPER(TRIM(?)), ?, ?)`, // Aplica UPPER y TRIM
            [nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario, imagen_url || null]
        );

        // Obtener la mascota recién creada para devolverla en la respuesta
        const [newMascota] = await pool.query("SELECT * FROM mascotas WHERE id_mascota = ?", [result.insertId]);

        res.status(201).json({ success: true, message: "Mascota registrada correctamente.", data: newMascota[0] });
        console.log("[CREATE_PET] Pet registered successfully:", nombre); // Log de depuración

    } catch (error) {
        console.error("Error al registrar mascota:", error);
        res.status(500).json({ success: false, message: "Error al registrar mascota.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar mascota
app.put("/mascotas/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, especie, raza, edad, peso, sexo, color, microchip, id_propietario, imagen_url } = req.body;
    console.log("[UPDATE_PET] Received data:", req.body, "for ID:", id); // Log de depuración

    try {
        // Si se intenta cambiar el propietario, verificar que el nuevo propietario sea válido
        if (id_propietario !== undefined) {
            const [owner] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'usuario'", [id_propietario]);
            if (owner.length === 0) {
                return res.status(400).json({ success: false, message: "El nuevo ID de propietario no es válido o no corresponde a un usuario regular." });
            }
        }

        // Construir la consulta de actualización dinámicamente
        const fields = [];
        const values = [];
        if (nombre !== undefined) { fields.push('nombre = UPPER(TRIM(?))'); values.push(nombre); } // Aplica UPPER y TRIM
        if (especie !== undefined) { fields.push('especie = UPPER(TRIM(?))'); values.push(especie); } // Aplica UPPER y TRIM
        if (raza !== undefined) { fields.push('raza = UPPER(TRIM(?))'); values.push(raza); } // Aplica UPPER y TRIM
        if (edad !== undefined) { fields.push('edad = ?'); values.push(edad); }
        if (peso !== undefined) { fields.push('peso = ?'); values.push(peso); }
        if (sexo !== undefined) { fields.push('sexo = UPPER(TRIM(?))'); values.push(sexo); } // Aplica UPPER y TRIM
        if (color !== undefined) { fields.push('color = UPPER(TRIM(?))'); values.push(color); } // Aplica UPPER y TRIM
        if (microchip !== undefined) { fields.push('microchip = UPPER(TRIM(?))'); values.push(microchip); } // Aplica UPPER y TRIM
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

        // Obtener la mascota actualizada para devolverla en la respuesta
        const [updatedMascota] = await pool.query("SELECT * FROM mascotas WHERE id_mascota = ?", [id]);
        res.json({ success: true, message: "Mascota actualizada correctamente.", data: updatedMascota[0] });
        console.log("[UPDATE_PET] Pet updated successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al actualizar mascota:", error);
        res.status(500).json({ success: false, message: "Error al actualizar mascota.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar mascota (solo para veterinarios o admins)
app.delete("/mascotas/:id", authenticateToken, isVetOrAdmin, async (req, res) => {
    const { id } = req.params;
    console.log("[DELETE_PET] Deleting pet with ID:", id); // Log de depuración

    try {
        // Eliminar registros de historial médico asociados a la mascota
        await pool.query("DELETE FROM historial_medico WHERE id_mascota = ?", [id]);

        // Eliminar citas asociadas a la mascota
        await pool.query("DELETE FROM citas WHERE id_mascota = ?", [id]);

        // Finalmente, eliminar la mascota
        const [result2] = await pool.query("DELETE FROM mascotas WHERE id_mascota = ?", [id]);

        if (result2.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Mascota no encontrada." });
        }
        res.json({ success: true, message: "Mascota y sus historiales/citas asociados eliminados correctamente." });
        console.log("[DELETE_PET] Pet deleted successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al eliminar mascota:", error);
        res.status(500).json({ success: false, message: "Error al eliminar mascota.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// =============================================================================
// RUTAS DE GESTIÓN DE HISTORIAL MÉDICO (Actualizadas para Veterinarios y Usuarios)
// =============================================================================

// Obtener todos los historiales médicos (para veterinarios y administradores, o filtrado para usuarios)
app.get("/historial_medico", authenticateToken, async (req, res) => {
    try {
        const { id_mascota } = req.query;
        let query = `SELECT h.*, m.nombre as mascota_nombre, m.especie, m.raza,
                    CONCAT(u_prop.nombre, ' ', u_prop.apellido) as propietario_nombre,
                    CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre,
                    u_vet.id as veterinario_id
             FROM historial_medico h
             JOIN mascotas m ON h.id_mascota = m.id_mascota
             JOIN usuarios u_prop ON m.id_propietario = u_prop.id
             LEFT JOIN usuarios u_vet ON h.veterinario = u_vet.id`;
        const queryParams = [];
        const conditions = [];

        if (req.user.role === 'usuario') {
            // Si es un usuario regular, solo puede ver el historial médico de sus propias mascotas.
            if (id_mascota) {
                // Verifica si la mascota pertenece al usuario
                const [petOwner] = await pool.query("SELECT id_propietario FROM mascotas WHERE id_mascota = ?", [id_mascota]);
                if (petOwner.length === 0 || petOwner[0].id_propietario !== req.user.id) {
                    return res.status(403).json({ success: false, message: "Acceso denegado. Solo puedes ver los historiales de tus propias mascotas." });
                }
                conditions.push(`h.id_mascota = ?`);
                queryParams.push(id_mascota);
            } else {
                // Si no se proporciona un ID de mascota, un usuario regular no puede ver todos los historiales.
                return res.status(403).json({ success: false, message: "Acceso denegado. Se requiere especificar una mascota para ver el historial." });
            }
        } else if (req.user.role === 'veterinario' || req.user.role === 'admin') {
            // Veterinarios y administradores pueden filtrar por id_mascota o ver todos los historiales.
            if (id_mascota) {
                conditions.push(`h.id_mascota = ?`);
                queryParams.push(id_mascota);
            }
        } else {
            return res.status(403).json({ success: false, message: "Acceso denegado. Rol no autorizado para ver historiales médicos." });
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY h.fecha_consulta DESC`;

        const [historiales] = await pool.query(query, queryParams);
        res.json({ success: true, data: historiales });
    } catch (error) {
        console.error("Error al obtener historiales médicos:", error);
        res.status(500).json({ success: false, message: "Error al obtener historiales médicos.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Obtener un historial médico por ID (propietario o admin/vet)
app.get("/historial_medico/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [historial] = await pool.query(
            `SELECT h.*, m.nombre as mascota_nombre, m.especie, m.raza,
                    CONCAT(u_prop.nombre, ' ', u_prop.apellido) as propietario_nombre,
                    CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre,
                    u_vet.id as veterinario_id
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
    }
    catch (error) {
        console.error(`Error al obtener historial médico ${id}:`, error);
        res.status(500).json({ success: false, message: "Error al obtener historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Registrar nuevo historial médico (solo para veterinarios o admins)
app.post("/historial_medico", authenticateToken, isVetOrAdmin, async (req, res) => {
    const { id_mascota, fecha_consulta, diagnostico, tratamiento, observaciones, veterinario, peso_actual, temperatura, proxima_cita } = req.body;

    if (!id_mascota || !fecha_consulta || !diagnostico || !tratamiento || !veterinario) {
        return res.status(400).json({ success: false, message: "Campos requeridos incompletos para el historial médico." });
    }
    console.log("[CREATE_MEDICAL_RECORD] Received data:", req.body); // Log de depuración

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

        // Obtener el registro de historial médico recién creado para devolverlo en la respuesta
        const [newRecord] = await pool.query("SELECT * FROM historial_medico WHERE id_historial = ?", [result.insertId]);

        res.status(201).json({ success: true, message: "Historial médico registrado correctamente.", data: newRecord[0] });
        console.log("[CREATE_MEDICAL_RECORD] Medical record created successfully for mascota:", id_mascota); // Log de depuración

    } catch (error) {
        console.error("Error al registrar historial médico:", error);
        res.status(500).json({ success: false, message: "Error al registrar historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar historial médico (solo para veterinarios o admins)
app.put("/historial_medico/:id", authenticateToken, isVetOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { fecha_consulta, diagnostico, tratamiento, observaciones, veterinario, peso_actual, temperatura, proxima_cita } = req.body;
    console.log("[UPDATE_MEDICAL_RECORD] Received data:", req.body, "for ID:", id); // Log de depuración

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

        // Obtener el registro de historial médico actualizado para devolverlo en la respuesta
        const [updatedRecord] = await pool.query("SELECT * FROM historial_medico WHERE id_historial = ?", [id]);
        res.json({ success: true, message: "Historial médico actualizado correctamente.", data: updatedRecord[0] });
        console.log("[UPDATE_MEDICAL_RECORD] Medical record updated successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al actualizar historial médico:", error);
        res.status(500).json({ success: false, message: "Error al actualizar historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar historial médico (solo para administradores)
app.delete("/historial_medico/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    console.log("[DELETE_MEDICAL_RECORD] Deleting medical record with ID:", id); // Log de depuración

    try {
        const [result] = await pool.query("DELETE FROM historial_medico WHERE id_historial = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Historial médico no encontrado." });
        }
        res.json({ success: true, message: "Historial médico eliminado correctamente." });
        console.log("[DELETE_MEDICAL_RECORD] Medical record deleted successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al eliminar historial médico:", error);
        res.status(500).json({ success: false, message: "Error al eliminar historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// =============================================================================
// RUTAS DE GESTIÓN DE CITAS (MODIFICADAS Y NUEVAS)
// =============================================================================

// **NUEVA RUTA:** Obtener las últimas citas registradas para el veterinario logeado (para el Dashboard)
app.get("/veterinario/citas/ultimas", authenticateToken, isVetOrAdmin, async (req, res) => {
    try {
        const veterinarioId = req.user.id;
        const [citas] = await pool.query(
            `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%dT%H:%i') as fecha_cita, c.estado,
                    s.nombre as servicio_nombre,
                    CONCAT(u_cli.nombre, ' ', u_cli.apellido) as propietario_nombre,
                    u_cli.apellido as propietario_apellido,
                    m.nombre as mascota_nombre, m.especie as mascota_especie,
                    m.imagen_url as mascota_imagen_url
             FROM citas c
             JOIN servicios s ON c.id_servicio = s.id_servicio
             JOIN usuarios u_cli ON c.id_cliente = u_cli.id
             JOIN mascotas m ON c.id_mascota = m.id_mascota
             WHERE c.id_veterinario = ? AND c.estado = 'PENDIENTE'
             ORDER BY c.fecha DESC
             LIMIT 5`, // Últimas 5 citas pendientes
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
            `SELECT COUNT(*) as count FROM citas WHERE id_veterinario = ? AND estado = 'COMPLETA'`,
            [veterinarioId]
        );
        res.json({ success: true, count });
    } catch (error) {
        console.error("Error al obtener conteo de citas completadas para veterinario:", error);
        res.status(500).json({ success: false, message: "Error al obtener conteo de citas completadas.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// Obtener todas las citas (MODIFICADA para aceptar parámetro de fecha Y estado)
app.get("/citas", authenticateToken, async (req, res) => {
    try {
        const { fecha, estado } = req.query; // Obtener el parámetro de fecha Y estado
        let query = `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%dT%H:%i') as fecha_cita, c.estado, c.servicios as notas_adicionales,
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
                            m.nombre as mascota_nombre, m.especie as mascota_especie, m.raza as mascota_raza,
                            m.imagen_url as mascota_imagen_url
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

        // Filtrar por estado si se proporciona
        if (estado) {
            conditions.push(`c.estado = ?`);
            queryParams.push(estado.toUpperCase()); // Asegurarse de que el estado se filtre en mayúsculas
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY c.fecha DESC`;

        const [citas] = await pool.query(query, queryParams);
        res.json({ success: true, data: citas });
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener citas.",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});

// Obtener una cita por ID (accesible por propietario o admin/vet)
app.get("/citas/:id", authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [cita] = await pool.query(
            `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%dT%H:%i') as fecha_cita, c.estado, c.servicios as notas_adicionales,
                    s.nombre as servicio_nombre, s.precio, s.id_servicio,
                    u_cli.id as id_cliente, CONCAT(u_cli.nombre, ' ', u_cli.apellido) as propietario_nombre, u_cli.telefono as propietario_telefono, u_cli.email as propietario_email, u_cli.direccion as propietario_direccion,
                    u_vet.id as id_veterinario, CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre, u_vet.email as veterinario_email,
                    u_vet.direccion as veterinario_direccion,
                    m.nombre as mascota_nombre, m.especie as mascota_especie, m.raza as mascota_raza,
                    m.imagen_url as mascota_imagen_url
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
// RUTA ÚNICA PARA CREAR CITAS: /citas/agendar
app.post("/citas/agendar", authenticateToken, async (req, res) => {
    let requestBody = req.body;

    // WORKAROUND: Si express.json() falló al parsear (porque recibió un JSON doblemente stringificado),
    // req.body podría estar vacío o no ser un objeto. Necesitamos re-leer el stream del cuerpo crudo.
    if (typeof requestBody !== 'object' || requestBody === null || Object.keys(requestBody).length === 0) {
        let rawData = '';
        await new Promise((resolve, reject) => {
            req.on('data', chunk => {
                rawData += chunk;
            });
            req.on('end', () => {
                resolve();
            });
            req.on('error', err => {
                reject(err);
            });
        });

        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            try {
                // Intenta parsear el rawData dos veces
                requestBody = JSON.parse(JSON.parse(rawData));
                console.warn("WORKAROUND: JSON doblemente stringificado detectado y re-parseado en la ruta /citas/agendar.");
            } catch (parseError) {
                console.error("WORKAROUND FALLÓ: No se pudo re-parsear JSON doblemente stringificado en la ruta /citas/agendar.", parseError);
                return res.status(400).json({ success: false, message: "Datos de solicitud inválidos o corruptos." });
            }
        } else {
            // Si no está doblemente stringificado, pero express.json() aún falló,
            // es probable que esté realmente malformado o vacío.
            console.error("El cuerpo de la solicitud no es un objeto y no es JSON doblemente stringificado. Datos crudos:", rawData);
            return res.status(400).json({ success: false, message: "Datos de solicitud inválidos." });
        }
    }

    const { fecha_cita, notas_adicionales, id_servicio, id_cliente, id_veterinario, id_mascota } = requestBody;
    const userRole = req.user.role;
    const userIdFromToken = req.user.id;

    // El estado por defecto para nuevas citas es PENDIENTE
    let estado = 'PENDIENTE';

    if (!fecha_cita || !id_servicio || !id_cliente || !id_mascota) {
        return res.status(400).json({ success: false, message: "Fecha, servicio, cliente y mascota son requeridos para la cita." });
    }

    // Un cliente solo puede crear citas para sí mismo
    if (userRole === 'usuario' && userIdFromToken !== id_cliente) {
        return res.status(403).json({ success: false, message: "Acceso denegado. No puedes crear citas para otros usuarios." });
    }

    console.log("[CREATE_APPOINTMENT] Received data:", requestBody); // Log de depuración

    let assignedVetId = id_veterinario;

    try {
        // Verifica que el servicio exista
        const [service] = await pool.query("SELECT id_servicio, nombre FROM servicios WHERE id_servicio = ?", [id_servicio]);
        if (service.length === 0) {
            return res.status(400).json({ success: false, message: "ID de servicio no válido." });
        }
        const servicio_nombre = service[0].nombre;

        // Verifica que el cliente exista y tenga el rol 'usuario'
        const [cliente] = await pool.query("SELECT id, nombre, apellido, email FROM usuarios WHERE id = ? AND role = 'usuario'", [id_cliente]);
        if (cliente.length === 0) {
            return res.status(400).json({ success: false, message: "ID de cliente no válido o no es un usuario." });
        }
        const cliente_nombre = `${cliente[0].nombre} ${cliente[0].apellido}`;
        const cliente_email = cliente[0].email;

        // Verifica que la mascota exista y pertenezca al cliente
        const [mascota] = await pool.query("SELECT id_mascota, nombre FROM mascotas WHERE id_mascota = ? AND id_propietario = ?", [id_mascota, id_cliente]);
        if (mascota.length === 0) {
            return res.status(400).json({ success: false, message: "ID de mascota no válido o la mascota no pertenece a este cliente." });
        }
        const mascota_nombre = mascota[0].nombre;

        // Si no se asigna un veterinario, asignar uno aleatoriamente
        if (!assignedVetId) {
            const [vets] = await pool.query("SELECT id FROM usuarios WHERE role = 'veterinario' AND active = 1");
            if (vets.length === 0) {
                return res.status(500).json({ success: false, message: "No hay veterinarios disponibles para asignar la cita." });
            }
            const randomIndex = Math.floor(Math.random() * vets.length);
            assignedVetId = vets[randomIndex].id;
        } else {
            // Validar si el ID de veterinario proporcionado es realmente un veterinario
            const [vet] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'veterinario'", [assignedVetId]);
            if (vet.length === 0) {
                return res.status(400).json({ success: false, message: "ID de veterinario no válido o no es un veterinario." });
            }
        }

        // Inserta la nueva cita en la base de datos
        const [result] = await pool.query(
            `INSERT INTO citas (fecha, estado, servicios, id_servicio, id_cliente, id_veterinario, id_mascota)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [fecha_cita, estado, notas_adicionales || null, id_servicio, id_cliente, assignedVetId, id_mascota]
        );

        const newCitaId = result.insertId;
        const [newCita] = await pool.query("SELECT * FROM citas WHERE id_cita = ?", [newCitaId]);

        // Lógica de notificaciones para la nueva cita (siempre PENDIENTE)
        const [assignedVet] = await pool.query("SELECT nombre, apellido, email FROM usuarios WHERE id = ?", [assignedVetId]);
        const vetName = assignedVet.length > 0 ? `${assignedVet[0].nombre} ${assignedVet[0].apellido}` : 'Veterinario asignado';
        const vetEmail = assignedVet.length > 0 ? assignedVet[0].email : null;

        // Notificar al veterinario asignado sobre la nueva cita PENDIENTE
        await pool.query(
            `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
            [assignedVetId, 'cita_creada_vet', `Nueva cita PENDIENTE de ${cliente_nombre} para ${mascota_nombre} (${servicio_nombre}) el ${fecha_cita}.`, newCitaId]
        );
        if (vetEmail) {
            simulateSendEmail(
                vetEmail,
                `Nueva Cita Pendiente - Flooky Pets`,
                `Hola Dr./Dra. ${vetName},\n\nSe ha solicitado una nueva cita pendiente:\n\nCliente: ${cliente_nombre}\nMascota: ${mascota_nombre}\nServicio: ${servicio_nombre}\nFecha y Hora: ${fecha_cita}\n\nPor favor, revisa tu panel para ACEPTAR o RECHAZAR esta cita.\n\nSaludos,\nEl equipo de Flooky Pets`
            );
        }

        // Notificar al cliente que su cita está PENDIENTE
        await pool.query(
            `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
            [id_cliente, 'cita_registrada_user', `Tu cita para ${mascota_nombre} (${servicio_nombre}) el ${fecha_cita} ha sido registrada y está PENDIENTE de confirmación.`, newCitaId]
        );


        res.status(201).json({ success: true, message: "Cita registrada correctamente y en estado PENDIENTE.", data: newCita[0] });
        console.log("[CREATE_APPOINTMENT] Appointment created successfully and is PENDING:", newCitaId); // Log de depuración

    } catch (error) {
        console.error("Error al registrar cita:", error);
        res.status(500).json({ success: false, message: "Error al registrar cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Actualizar cita (admin/vet/owner para cancelar)
app.put("/citas/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    let requestBody = req.body; // Cambiado de 'let { ... } = req.body;' para permitir reasignación
    console.log("[UPDATE_APPOINTMENT] Received data:", requestBody, "for ID:", id);

    // WORKAROUND: Si express.json() falló al parsear (porque recibió un JSON doblemente stringificado),
    // req.body podría estar vacío o no ser un objeto. Necesitamos re-leer el stream del cuerpo crudo.
    if (typeof requestBody !== 'object' || requestBody === null || Object.keys(requestBody).length === 0) {
        let rawData = '';
        await new Promise((resolve, reject) => {
            req.on('data', chunk => {
                rawData += chunk;
            });
            req.on('end', () => {
                resolve();
            });
            req.on('error', err => {
                reject(err);
            });
        });

        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            try {
                // Intenta parsear el rawData dos veces
                requestBody = JSON.parse(JSON.parse(rawData));
                console.warn("WORKAROUND: JSON doblemente stringificado detectado y re-parseado en la ruta PUT /citas/:id.");
            } catch (parseError) {
                console.error("WORKAROUND FALLÓ: No se pudo re-parsear JSON doblemente stringificado en la ruta PUT /citas/:id.", parseError);
                return res.status(400).json({ success: false, message: "Datos de solicitud inválidos o corruptos." });
            }
        } else {
            // Si no está doblemente stringificado, pero express.json() aún falló,
            // es probable que esté realmente malformado o vacío.
            console.error("El cuerpo de la solicitud no es un objeto y no es JSON doblemente stringificado. Datos crudos:", rawData);
            return res.status(400).json({ success: false, message: "Datos de solicitud inválidos." });
        }
    }

    // Ahora, extrae las propiedades de requestBody
    const { fecha_cita, estado, notas_adicionales, id_servicio, id_cliente, id_veterinario, id_mascota } = requestBody;

    try {
        const userIdFromToken = req.user.id;
        const userRole = req.user.role;

        // Obtener la cita existente para verificar permisos y estado anterior
        const [citaResult] = await pool.query("SELECT id_cliente, id_veterinario, estado, id_mascota FROM citas WHERE id_cita = ?", [id]);
        if (citaResult.length === 0) {
            return res.status(404).json({ success: false, message: "Cita no encontrada." });
        }
        const existingCita = citaResult[0];
        const oldEstado = existingCita.estado;
        const newEstadoUpper = estado ? estado.toUpperCase() : null; // Asegura que el nuevo estado esté en mayúsculas para la comparación

        let isAuthorized = false;

        if (userRole === 'admin') {
            // El administrador puede realizar cualquier acción
            isAuthorized = true;
        } else if (userRole === 'usuario') {
            // Un usuario regular solo puede cancelar sus propias citas
            if (userIdFromToken === existingCita.id_cliente && newEstadoUpper === 'CANCELADA') {
                isAuthorized = true;
            } else {
                return res.status(403).json({ success: false, message: "Acceso denegado. Los usuarios solo pueden cancelar sus propias citas." });
            }
        } else if (userRole === 'veterinario') {
            // Un veterinario puede aceptar, rechazar, completar o cancelar sus citas asignadas
            if (userIdFromToken === existingCita.id_veterinario) {
                if (['ACEPTADA', 'RECHAZADA', 'COMPLETA', 'CANCELADA'].includes(newEstadoUpper)) {
                    isAuthorized = true;
                } else {
                    return res.status(403).json({ success: false, message: "Acceso denegado. Los veterinarios solo pueden aceptar, rechazar, completar o cancelar sus citas asignadas." });
                }
            } else {
                return res.status(403).json({ success: false, message: "Acceso denegado. No eres el veterinario asignado a esta cita." });
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permisos para realizar esta acción." });
        }

        const fields = [];
        const values = [];

        if (fecha_cita !== undefined) { fields.push('fecha = ?'); values.push(fecha_cita); }

        if (newEstadoUpper !== null) {
            fields.push('estado = ?'); values.push(newEstadoUpper); // Guarda el estado en mayúsculas
        }

        if (notas_adicionales !== undefined) { fields.push('servicios = ?'); values.push(notas_adicionales); }

        if (id_servicio !== undefined) {
            const [service] = await pool.query("SELECT id_servicio FROM servicios WHERE id_servicio = ?", [id_servicio]);
            if (service.length === 0) return res.status(400).json({ success: false, message: "ID de servicio no válido." });
            fields.push('id_servicio = ?'); values.push(id_servicio);
        }

        // IMPORTANTE: Re-validar id_mascota contra id_cliente al actualizar
        if (id_mascota !== undefined) {
            // Asegura que el id_mascota proporcionado pertenezca al id_cliente *actual* de la cita
            // o al *nuevo* id_cliente si también se está cambiando en esta solicitud (solo por admin)
            const targetClientId = (userRole === 'admin' && id_cliente !== undefined) ? id_cliente : existingCita.id_cliente;

            const [mascota] = await pool.query("SELECT id_mascota FROM mascotas WHERE id_mascota = ? AND id_propietario = ?", [id_mascota, targetClientId]);
            if (mascota.length === 0) {
                return res.status(400).json({ success: false, message: "ID de mascota no válido o la mascota no pertenece al cliente de esta cita." });
            }
            fields.push('id_mascota = ?'); values.push(id_mascota);
        }

        // Solo el administrador puede cambiar el cliente o el veterinario de una cita
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
            } else if (requestBody.hasOwnProperty('id_veterinario') && id_veterinario === null) { // Usa requestBody aquí
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

        // Obtener la cita actualizada para enviar notificaciones
        const [updatedCitaRows] = await pool.query(
            `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%dT%H:%i') as fecha_cita, c.estado, c.servicios as notas_adicionales,
                    s.nombre as servicio_nombre, s.precio, s.id_servicio,
                    u_cli.id as id_cliente, CONCAT(u_cli.nombre, ' ', u_cli.apellido) as propietario_nombre, u_cli.telefono as propietario_telefono, u_cli.email as propietario_email, u_cli.direccion as propietario_direccion,
                    u_vet.id as id_veterinario, CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario_nombre, u_vet.email as veterinario_email,
                    u_vet.direccion as veterinario_direccion,
                    m.nombre as mascota_nombre, m.especie as mascota_especie, m.raza as mascota_raza,
                    m.imagen_url as mascota_imagen_url
             FROM citas c
             JOIN servicios s ON c.id_servicio = s.id_servicio
             JOIN usuarios u_cli ON c.id_cliente = u_cli.id
             LEFT JOIN usuarios u_vet ON c.id_veterinario = u_vet.id
             LEFT JOIN mascotas m ON c.id_mascota = m.id_mascota
             WHERE c.id_cita = ?`,
            [id]
        );
        const updatedCita = updatedCitaRows[0];

        // Lógica de notificaciones solo si el estado ha cambiado
        if (newEstadoUpper !== oldEstado.toUpperCase()) {
            const clienteEmail = updatedCita.propietario_email;
            const clienteId = updatedCita.id_cliente;
            const servicioNombre = updatedCita.servicio_nombre;
            const citaFecha = updatedCita.fecha_cita;
            const veterinarioNombre = updatedCita.veterinario_nombre;
            const veterinarioEmail = updatedCita.veterinario_email;
            const veterinarioId = updatedCita.id_veterinario;
            const mascotaNombre = updatedCita.mascota_nombre;


            if (newEstadoUpper === 'ACEPTADA') {
                await pool.query(
                    `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                    [clienteId, 'cita_aceptada_user', `Tu cita para ${mascotaNombre} (${servicioNombre}) el ${citaFecha} ha sido ACEPTADA por ${veterinarioNombre}.`, id]
                );
                simulateSendEmail(
                    clienteEmail,
                    `Confirmación de Cita Aceptada - Flooky Pets`,
                    `Hola ${updatedCita.propietario_nombre},\n\nTu cita para el servicio de ${servicioNombre} para ${mascotaNombre} ha sido ACEPTADA.\n\nDetalles de la cita:\nFecha y Hora: ${citaFecha}\nVeterinario: ${veterinarioNombre}\nUbicación: ${updatedCita.veterinario_direccion || 'No especificada'}\n\n¡Te esperamos!\n\nSaludos,\nEl equipo de Flooky Pets`
                );
            } else if (newEstadoUpper === 'RECHAZADA') {
                await pool.query(
                    `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                    [clienteId, 'cita_rechazada_user', `Tu cita para ${mascotaNombre} (${servicioNombre}) el ${citaFecha} ha sido RECHAZADA por ${veterinarioNombre}. Por favor, reagenda o contacta al veterinario.`, id]
                );
            } else if (newEstadoUpper === 'CANCELADA') {
                // Determinar quién canceló para enviar la notificación apropiada
                if (userRole === 'usuario' && userIdFromToken === clienteId) {
                    // Cliente canceló
                    // Solo notificar al veterinario si hay uno asignado
                    if (veterinarioId) {
                        await pool.query(
                            `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                            [veterinarioId, 'cita_cancelada_vet', `La cita de ${updatedCita.propietario_nombre} para ${mascotaNombre} el ${citaFecha} ha sido CANCELADA por el cliente.`, id]
                        );
                    }
                } else if (userRole === 'veterinario' && userIdFromToken === veterinarioId) {
                    // Veterinario canceló
                    await pool.query(
                        `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                        [clienteId, 'cita_cancelada_user', `Tu cita para ${mascotaNombre} (${servicioNombre}) el ${citaFecha} ha sido CANCELADA por el veterinario ${veterinarioNombre}.`, id]
                    );
                } else if (userRole === 'admin') {
                    // Administrador canceló
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
            } else if (newEstadoUpper === 'COMPLETA') {
                // Solo veterinario o administrador pueden marcar como completa, notificar al cliente
                await pool.query(
                    `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
                    [clienteId, 'cita_completada_user', `Tu cita para ${mascotaNombre} (${servicioNombre}) el ${citaFecha} ha sido marcada como COMPLETADA por ${veterinarioNombre}.`, id]
                );
            }
        }

        res.json({ success: true, message: "Cita actualizada correctamente.", data: updatedCita });
        console.log("[UPDATE_APPOINTMENT] Appointment updated successfully:", id);

    } catch (error) {
        console.error("Error al actualizar cita:", error);
        res.status(500).json({ success: false, message: "Error al actualizar cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar cita (solo para administradores)
app.delete("/citas/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    console.log("[DELETE_APPOINTMENT] Deleting appointment with ID:", id); // Log de depuración

    try {
        const [result] = await pool.query("DELETE FROM citas WHERE id_cita = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Cita no encontrada." });
        }
        res.json({ success: true, message: "Cita eliminada correctamente." });
        console.log("[DELETE_APPOINTMENT] Appointment deleted successfully:", id); // Log de depuración

    } catch (error) {
        console.error("Error al eliminar cita:", error);
        res.status(500).json({ success: false, message: "Error al eliminar cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// =============================================================================
// RUTAS DE GESTIÓN DE NOTIFICACIONES
// =============================================================================
// Nueva ruta para obtener notificaciones por ID de usuario
app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        // Validar que userId sea un número
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, message: "ID de usuario inválido." });
        }

        const [rows] = await pool.query(
            "SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC",
            [userId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching user notifications:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener notificaciones." });
    }
});

// Ruta para marcar una notificación como leída (PUT)
app.put("/api/notifications/mark-read/:id_notificacion", async (req, res) => {
    try {
        const { id_notificacion } = req.params;
        // Validar que id_notificacion sea un número
        if (isNaN(id_notificacion)) {
            return res.status(400).json({ success: false, message: "ID de notificación inválido." });
        }

        // Se puede validar que el usuario que intenta marcar como leída la notificación
        // sea el propietario de la misma, usando el token JWT.
        // Esto depende de cómo implementes tu autenticación y autorización.
        // Por ahora, asumimos que el token ya validó al usuario.

        const [result] = await pool.query(
            "UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = ?",
            [id_notificacion]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Notificación no encontrada o ya marcada como leída." });
        }

        res.json({ success: true, message: "Notificación marcada como leída exitosamente." });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al marcar notificación como leída." });
    }
});

// Ruta para obtener notificaciones por ID de usuario (cliente o veterinario)
// Esta ruta es utilizada por el frontend para cargar las notificaciones del usuario logeado.
app.get('/api/notifications/user/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;
        // Verifica si el usuario autenticado tiene permiso para ver estas notificaciones
        // (admin, veterinario o el propio usuario)
        if (req.user.role !== 'admin' && req.user.role !== 'veterinario' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permiso para ver estas notificaciones." });
        }

        const [notifications] = await pool.query(
            `SELECT id_notificacion, id_usuario, tipo, mensaje, leida, fecha_creacion, referencia_id
             FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC`,
            [userId]
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error("Error al obtener notificaciones por usuario:", error);
        res.status(500).json({ success: false, message: "Error al obtener notificaciones", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Marcar una notificación como leída
// CORREGIDO: Ruta cambiada de "/api/notifications/mark-read/:notificationId" a "/api/notifications/:notificationId/read"
app.put("/api/notifications/:notificationId/read", authenticateToken, async (req, res) => {
    const { notificationId } = req.params;
    const userIdFromToken = req.user.id;
    const { leida } = req.body; // Se espera 'leida' (booleano) en el cuerpo de la solicitud

    if (typeof leida === 'undefined') {
        return res.status(400).json({ success: false, message: 'El estado "leida" es requerido.' });
    }

    try {
        // Primero, verificar que la notificación pertenece al usuario autenticado o es admin
        const [notificationCheck] = await pool.query(
            `SELECT id_usuario FROM notificaciones WHERE id_notificacion = ?`,
            [notificationId]
        );

        if (notificationCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'Notificación no encontrada.' });
        }

        if (notificationCheck[0].id_usuario !== userIdFromToken && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'No tienes permiso para marcar esta notificación como leída.' });
        }

        const [result] = await pool.query(
            `UPDATE notificaciones SET leida = ? WHERE id_notificacion = ?`,
            [leida, notificationId]
        );

        if (result.affectedRows === 0) {
            // Esto podría ocurrir si la notificación ya estaba en el estado solicitado
            return res.status(404).json({ success: false, message: 'Notificación no encontrada o ya estaba en el estado solicitado.' });
        }
        res.json({ success: true, message: 'Notificación actualizada exitosamente.' });
    } catch (error) {
        console.error("Error al marcar notificación como leída:", error);
        res.status(500).json({ success: false, message: "Error al marcar notificación como leída.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Eliminar una notificación
app.delete("/api/notifications/:notificationId", authenticateToken, async (req, res) => {
    const { notificationId } = req.params;
    const userIdFromToken = req.user.id;
    const userRoleFromToken = req.user.role;

    try {
        // Primero, verificar que la notificación pertenece al usuario autenticado o es admin
        const [notificationCheck] = await pool.query(
            `SELECT id_usuario FROM notificaciones WHERE id_notificacion = ?`,
            [notificationId]
        );

        if (notificationCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'Notificación no encontrada.' });
        }

        if (notificationCheck[0].id_usuario !== userIdFromToken && userRoleFromToken !== 'admin') {
            return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta notificación.' });
        }

        const [result] = await pool.query(
            `DELETE FROM notificaciones WHERE id_notificacion = ?`,
            [notificationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Notificación no encontrada.' });
        }
        res.json({ success: true, message: 'Notificación eliminada exitosamente.' });
    } catch (error) {
        console.error("Error al eliminar notificación:", error);
        res.status(500).json({ success: false, message: "Error al eliminar notificación.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});

// Ruta para crear una notificación (ej. para uso interno del backend al agendar/cancelar citas)
// Esta ruta podría ser invocada por otras funciones del backend, no necesariamente desde el frontend directamente
app.post('/api/notifications', authenticateToken, async (req, res) => {
    const { id_usuario, tipo, mensaje, referencia_id } = req.body;
    const creatorIdFromToken = req.user.id;
    const creatorRoleFromToken = req.user.role;

    // Solo un administrador o el sistema (representado por un veterinario/admin creando para sí mismo)
    // puede crear notificaciones para otros usuarios.
    if (creatorRoleFromToken !== 'admin' && creatorIdFromToken !== id_usuario) {
        return res.status(403).json({ success: false, message: 'No tienes permiso para crear notificaciones para otros usuarios.' });
    }

    if (!id_usuario || !tipo || !mensaje) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: id_usuario, tipo, mensaje.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
            [id_usuario, tipo, mensaje, referencia_id || null]
        );
        res.status(201).json({ success: true, message: 'Notificación creada exitosamente.', id: result.insertId });
    } catch (error) {
        console.error("Error al crear notificación:", error);
        res.status(500).json({ success: false, message: "Error al crear notificación.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});


// =============================================================================
// RUTAS YA EXISTENTES Y AJUSTADAS PARA COHERENCIA
// =============================================================================

// ### **VISUALIZACIÓN DE CITAS** (Endpoint para Admin)
app.get("/admin/citas", authenticateToken, isAdmin, async (req, res) => {
    try {
        let query = `SELECT c.id_cita, DATE_FORMAT(c.fecha, '%Y-%m-%dT%H:%i') as fecha, c.estado, c.servicios as notas_adicionales,
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
        const conditions = [];
        const { status } = req.query;

        if (status && status !== 'all') {
            conditions.push(`c.estado = ?`);
            queryParams.push(status.toUpperCase()); // Asegurar que el estado se filtre en mayúsculas
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
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
            CONCAT(v.nombre, ' ', v.apellido) as veterinario,
            h.veterinario as veterinario_id, /* Añadido para el frontend */
            h.id_mascota /* Añadido para el frontend */
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
// Ruta para obtener todas las citas (accesible para admin y veterinarios, o clientes viendo sus propias citas)
app.get('/api/citas', authenticateToken, async (req, res) => {
    try {
        const { role, id: userId } = req.user; // Obtener rol e ID del usuario autenticado

        let query = `
            SELECT
                c.*,
                u.nombre AS cliente_nombre,
                u.apellido AS cliente_apellido,
                m.nombre AS mascota_nombre,
                v.nombre AS veterinario_nombre,
                v.apellido AS veterinario_apellido,
                s.nombre AS servicio_nombre
            FROM
                citas c
            JOIN
                usuarios u ON c.id_cliente = u.id
            JOIN
                mascotas m ON c.id_mascota = m.id_mascota
            JOIN
                servicios s ON c.id_servicio = s.id_servicio
            LEFT JOIN
                usuarios v ON c.id_veterinario = v.id`;

        const queryParams = [];

        if (role === 'veterinario') {
            query += ` WHERE c.id_veterinario = ?`;
            queryParams.push(userId);
        } else if (role === 'usuario') {
            query += ` WHERE c.id_cliente = ?`;
            queryParams.push(userId);
        }
        // Si es admin, no se agrega WHERE, ve todas las citas

        query += ` ORDER BY c.fecha DESC`;

        const [citas] = await pool.query(query, queryParams);
        res.json({ success: true, data: citas });
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener citas.",
            error: process.env.NODE_ENV === 'development' ? error.stack : error.message
        });
    }
});
// Ruta para verificar si un email ya existe
app.post("/check-email-exists", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email es requerido." });
    }
    try {
        // Normaliza el email para la búsqueda (mayúsculas, sin espacios al inicio/final)
        const [existingUsers] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email.toUpperCase().trim()]);
        res.json({ success: true, exists: existingUsers.length > 0 });
    } catch (error) {
        console.error("Error al verificar existencia de email:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al verificar email." });
    }
});
app.get("/admin/usuarios", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await pool.query("SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE role = 'usuario'");
        res.json(users); // Esto envía directamente el arreglo de usuarios
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener usuarios." });
    }
});
// Obtener una cita por ID
app.get('/citas/:id', authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT
                c.id_cita,
                c.id_cliente,
                u.nombre AS propietario_nombre,
                u.apellido AS propietario_apellido,
                c.id_mascota,
                m.nombre AS mascota_nombre,
                c.id_servicio,
                s.nombre AS servicio_nombre,
                c.id_veterinario,
                uv.nombre AS veterinario_nombre,
                uv.apellido AS veterinario_apellido,
                DATE_FORMAT(c.fecha, '%Y-%m-%dT%H:%i') AS fecha_cita, -- Changed format here
                c.servicios AS notas_adicionales, -- Alias 'servicios' como 'notas_adicionales'
                c.estado
            FROM citas c
            JOIN usuarios u ON c.id_cliente = u.id
            JOIN mascotas m ON c.id_mascota = m.id_mascota
            JOIN servicios s ON c.id_servicio = s.id_servicio
            LEFT JOIN usuarios uv ON c.id_veterinario = uv.id
            WHERE c.id_cita = ?
        `;
        const [rows] = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Cita no encontrada." });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error fetching appointment by ID:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener la cita." });
    }
});
// Obtener todas las mascotas
app.get('/mascotas', authenticateToken, isOwnerOrAdmin, async (req, res) => {
    try {
        const { id_propietario } = req.query;
        let query = `SELECT id_mascota, id_propietario, nombre, especie, raza, edad, peso, fecha_nacimiento, color, sexo, microchip, imagen_url FROM mascotas`;
        const queryParams = [];
        const conditions = [];

        if (req.user.role === 'usuario') {
            conditions.push(`id_propietario = ?`);
            queryParams.push(req.user.id);
        } else if (id_propietario) {
            conditions.push(`id_propietario = ?`);
            queryParams.push(id_propietario);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        query += ` ORDER BY nombre ASC`;

        const [rows] = await pool.query(query, queryParams);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching pets:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener mascotas." });
    }
});
app.get('/servicios', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT id_servicio, nombre, descripcion, precio FROM servicios`);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching servicios:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener servicios." });
    }
});
// Obtener todas las citas, con detalles de cliente, mascota, servicio y veterinario
app.get('/citas', authenticateToken, async (req, res) => {
    try {
        const { role, id: userId } = req.user; // Obtener rol e ID del usuario autenticado
        const { fecha, estado } = req.query; // Obtener el parámetro de fecha Y estado

        let query = `
            SELECT
                c.id_cita,
                c.id_cliente,
                u.nombre AS propietario_nombre,
                u.apellido AS propietario_apellido,
                u.telefono AS propietario_telefono,
                u.email AS propietario_email,
                u.direccion AS propietario_direccion,
                c.id_mascota,
                m.nombre AS mascota_nombre,
                m.especie AS mascota_especie,
                m.raza AS mascota_raza,
                m.imagen_url AS mascota_imagen_url,
                c.id_servicio,
                s.nombre AS servicio_nombre,
                s.precio,
                c.id_veterinario,
                uv.nombre AS veterinario_nombre,
                uv.apellido AS veterinario_apellido,
                uv.email AS veterinario_email,
                uv.direccion AS veterinario_direccion,
                DATE_FORMAT(c.fecha, '%Y-%m-%dT%H:%i') AS fecha_cita, -- Changed format here
                c.servicios AS notas_adicionales, -- Alias 'servicios' como 'notas_adicionales'
                c.estado
            FROM citas c
            JOIN usuarios u ON c.id_cliente = u.id
            JOIN mascotas m ON c.id_mascota = m.id_mascota
            JOIN servicios s ON c.id_servicio = s.id_servicio
            LEFT JOIN usuarios uv ON c.id_veterinario = uv.id
        `;

        const queryParams = [];
        const conditions = [];

        if (role === 'veterinario') {
            conditions.push(`c.id_veterinario = ?`);
            queryParams.push(userId);
        } else if (role === 'usuario') {
            conditions.push(`c.id_cliente = ?`);
            queryParams.push(userId);
        }

        if (fecha) {
            conditions.push(`DATE(c.fecha) = ?`);
            queryParams.push(fecha);
        }

        if (estado) {
            conditions.push(`c.estado = ?`);
            queryParams.push(estado.toUpperCase());
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY c.fecha DESC`;

        const [rows] = await pool.query(query, queryParams);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener citas." });
    }
});
// ... (asegúrate de que authorizeRoles esté definido antes de usarlo, como se explicó en la respuesta anterior)

// Ruta para registrar nueva cita (para usuarios, veterinarios y administradores)
// Esta ruta maneja la creación de citas con lógica de asignación de veterinario y notificaciones.
app.post("/citas/agendar", authenticateToken, authorizeRoles(['veterinario', 'admin', 'usuario']), async (req, res) => {
    let requestBody = req.body;

    // WORKAROUND: Si express.json() falló al parsear (porque recibió un JSON doblemente stringificado),
    // req.body podría estar vacío o no ser un objeto. Necesitamos re-leer el stream del cuerpo crudo.
    if (typeof requestBody !== 'object' || requestBody === null || Object.keys(requestBody).length === 0) {
        let rawData = '';
        await new Promise((resolve, reject) => {
            req.on('data', chunk => {
                rawData += chunk;
            });
            req.on('end', () => {
                resolve();
            });
            req.on('error', err => {
                reject(err);
            });
        });

        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            try {
                // Intenta parsear el rawData dos veces
                requestBody = JSON.parse(JSON.parse(rawData));
                console.warn("WORKAROUND: JSON doblemente stringificado detectado y re-parseado en la ruta POST /citas/agendar.");
            } catch (parseError) {
                console.error("WORKAROUND FALLÓ: No se pudo re-parsear JSON doblemente stringificado en la ruta POST /citas/agendar.", parseError);
                return res.status(400).json({ success: false, message: "Datos de solicitud inválidos o corruptos." });
            }
        } else {
            // Si no está doblemente stringificado, pero express.json() aún falló,
            // es probable que esté realmente malformado o vacío.
            console.error("El cuerpo de la solicitud no es un objeto y no es JSON doblemente stringificado. Datos crudos:", rawData);
            return res.status(400).json({ success: false, message: "Datos de solicitud inválidos." });
        }
    }

    const { fecha_cita, notas_adicionales, id_servicio, id_cliente, id_veterinario, id_mascota } = requestBody;
    const userRole = req.user.role;
    const userIdFromToken = req.user.id;

    // El estado por defecto para nuevas citas es PENDIENTE
    let estado = 'PENDIENTE';

    // Validación de campos obligatorios
    if (!fecha_cita || !id_servicio || !id_cliente || !id_mascota) {
        return res.status(400).json({ success: false, message: "Fecha, servicio, cliente y mascota son requeridos para la cita." });
    }

    // Lógica de autorización para id_cliente
    // Un usuario normal solo puede crear citas para sí mismo.
    // Un veterinario o administrador puede crear citas para cualquier cliente.
    if (userRole === 'usuario' && userIdFromToken !== id_cliente) {
        return res.status(403).json({ success: false, message: "Acceso denegado. No puedes crear citas para otros usuarios." });
    }

    console.log("[CREATE_APPOINTMENT] Received data:", requestBody); // Log de depuración

    let assignedVetId = id_veterinario; // Intenta usar el ID de veterinario proporcionado

    try {
        // Verificar que el servicio exista
        const [service] = await pool.query("SELECT id_servicio, nombre FROM servicios WHERE id_servicio = ?", [id_servicio]);
        if (service.length === 0) {
            return res.status(400).json({ success: false, message: "ID de servicio no válido." });
        }
        const servicio_nombre = service[0].nombre;

        // Verificar que el cliente exista y tenga el rol 'usuario'
        const [cliente] = await pool.query("SELECT id, nombre, apellido, email FROM usuarios WHERE id = ? AND role = 'usuario'", [id_cliente]);
        if (cliente.length === 0) {
            return res.status(400).json({ success: false, message: "ID de cliente no válido o no es un usuario." });
        }
        const cliente_nombre = `${cliente[0].nombre} ${cliente[0].apellido}`;
        const cliente_email = cliente[0].email;

        // Verificar que la mascota exista y pertenezca al cliente
        const [mascota] = await pool.query("SELECT id_mascota, nombre FROM mascotas WHERE id_mascota = ? AND id_propietario = ?", [id_mascota, id_cliente]);
        if (mascota.length === 0) {
            return res.status(400).json({ success: false, message: "ID de mascota no válido o la mascota no pertenece a este cliente." });
        }
        const mascota_nombre = mascota[0].nombre;

        // Lógica de asignación de veterinario si no se proporcionó uno
        if (!assignedVetId) {
            if (userRole === 'veterinario') {
                // Si el usuario logeado es un veterinario y no asignó un veterinario, se auto-asigna.
                assignedVetId = userIdFromToken;
            } else {
                // Si es admin o usuario, se asigna un veterinario activo aleatoriamente.
                const [vets] = await pool.query("SELECT id FROM usuarios WHERE role = 'veterinario' AND active = 1");
                if (vets.length === 0) {
                    return res.status(500).json({ success: false, message: "No hay veterinarios disponibles para asignar la cita." });
                }
                const randomIndex = Math.floor(Math.random() * vets.length);
                assignedVetId = vets[randomIndex].id;
            }
        } else {
            // Si se proporcionó un ID de veterinario, validar que sea un veterinario válido.
            const [vet] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'veterinario'", [assignedVetId]);
            if (vet.length === 0) {
                return res.status(400).json({ success: false, message: "ID de veterinario no válido o no es un veterinario." });
            }
        }

        // Insertar la nueva cita en la base de datos
        const [result] = await pool.query(
            `INSERT INTO citas (fecha, estado, servicios, id_servicio, id_cliente, id_veterinario, id_mascota)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [fecha_cita, estado, notas_adicionales || null, id_servicio, id_cliente, assignedVetId, id_mascota]
        );

        const newCitaId = result.insertId;
        // Obtener la cita recién creada para la respuesta (con detalles completos)
        const [newCita] = await pool.query("SELECT * FROM citas WHERE id_cita = ?", [newCitaId]);

        // Lógica de notificaciones para la nueva cita (siempre PENDIENTE)
        const [assignedVetDetails] = await pool.query("SELECT nombre, apellido, email FROM usuarios WHERE id = ?", [assignedVetId]);
        const vetName = assignedVetDetails.length > 0 ? `${assignedVetDetails[0].nombre} ${assignedVetDetails[0].apellido}` : 'Veterinario asignado';
        const vetEmail = assignedVetDetails.length > 0 ? assignedVetDetails[0].email : null;
        const fecha_cita_formato = new Date(fecha_cita).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });


        // Notificar al veterinario asignado sobre la nueva cita PENDIENTE
        await pool.query(
            `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
            [assignedVetId, 'cita_creada_vet', `Nueva cita PENDIENTE de ${cliente_nombre} para ${mascota_nombre} (${servicio_nombre}) el ${fecha_cita_formato}.`, newCitaId]
        );
        if (vetEmail) {
            simulateSendEmail(
                vetEmail,
                `Nueva Cita Pendiente - Flooky Pets`,
                `Hola Dr./Dra. ${vetName},\n\nSe ha solicitado una nueva cita pendiente:\n\nCliente: ${cliente_nombre}\nMascota: ${mascota_nombre}\nServicio: ${servicio_nombre}\nFecha y Hora: ${fecha_cita_formato}\n\nPor favor, revisa tu panel para ACEPTAR o RECHAZAR esta cita.\n\nSaludos,\nEl equipo de Flooky Pets`
            );
        }

        // Notificar al cliente que su cita está PENDIENTE
        await pool.query(
            `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
            [id_cliente, 'cita_registrada_user', `Tu cita para ${mascota_nombre} (${servicio_nombre}) el ${fecha_cita_formato} ha sido registrada y está PENDIENTE de confirmación.`, newCitaId]
        );


        res.status(201).json({ success: true, message: "Cita registrada correctamente y en estado PENDIENTE.", data: newCita[0] });
        console.log("[CREATE_APPOINTMENT] Appointment created successfully and is PENDING:", newCitaId); // Log de depuración

    } catch (error) {
        console.error("Error al registrar cita:", error);
        // Manejo específico de errores si es necesario (ej. clave foránea no encontrada)
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) { // MySQL error for foreign key constraint fail
            return res.status(400).json({ success: false, message: 'Error de datos: Cliente, servicio, veterinario o mascota no existen en la base de datos.' });
        }
        res.status(500).json({ success: false, message: "Error interno del servidor al registrar la cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});
// Ruta para crear una nueva cita (POST)
// Ruta para crear una nueva cita
app.post("/citas", authenticateToken, async (req, res) => {
    try {
        console.log("[CREATE_APPOINTMENT] Received data:", req.body);
        const {
            id_cliente,
            id_mascota,
            id_servicio,
            id_veterinario,
            fecha_cita, // Esta es la cadena ISO del frontend
            notas_adicionales,
            estado
        } = req.body;

        // Validación básica (agrega validaciones más robustas según sea necesario)
        if (!id_cliente || !id_mascota || !id_servicio || !id_veterinario || !fecha_cita || !estado) {
            return res.status(400).json({ success: false, message: "Faltan campos obligatorios para registrar la cita." });
        }

        // --- IMPORTANTE: Formatear fecha_cita para MySQL DATETIME ---
        let formattedFechaCita = null;
        if (fecha_cita) {
            const date = new Date(fecha_cita);
            // Formatear a YYYY-MM-DD HH:MM:SS
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            formattedFechaCita = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        // --- FIN Formateo de Fecha ---

        const query = `
            INSERT INTO citas (id_cliente, id_mascota, id_servicio, id_veterinario, fecha, notas_adicionales, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            id_cliente,
            id_mascota,
            id_servicio,
            id_veterinario,
            formattedFechaCita, // Usar la fecha formateada
            notas_adicionales,
            estado
        ]);

        res.status(201).json({ success: true, message: "Cita registrada exitosamente.", id: result.insertId });

    } catch (error) {
        console.error("Error al registrar cita:", error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
            return res.status(400).json({ success: false, message: 'Error de datos: Cliente, servicio, veterinario o mascota no existen en la base de datos.' });
        }
        res.status(500).json({ success: false, message: "Error interno del servidor al registrar la cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});
// Ruta para registrar un nuevo historial médico
app.post("/historial_medico", authenticateToken, async (req, res) => {
    try {
        console.log("[CREATE_MEDICAL_RECORD] Received data:", req.body);
        const {
            id_mascota,
            fecha_consulta, // Esta es la cadena ISO
            diagnostico,
            tratamiento,
            observaciones,
            veterinario,
            peso_actual,
            temperatura,
            proxima_cita // Esta es la cadena ISO
        } = req.body;

        // Validación básica
        if (!id_mascota || !fecha_consulta || !diagnostico || !tratamiento || !veterinario || peso_actual === undefined || temperatura === undefined) {
            return res.status(400).json({ success: false, message: "Faltan campos obligatorios para registrar el historial médico." });
        }

        // --- IMPORTANTE: Formatear fechas para MySQL DATETIME ---
        let formattedFechaConsulta = null;
        if (fecha_consulta) {
            const date = new Date(fecha_consulta);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            formattedFechaConsulta = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        let formattedProximaCita = null;
        if (proxima_cita) {
            const date = new Date(proxima_cita);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            formattedProximaCita = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        // --- FIN Formateo de Fechas ---

        const query = `
            INSERT INTO historial_medico (id_mascota, fecha_consulta, diagnostico, tratamiento, observaciones, veterinario, peso_actual, temperatura, proxima_cita)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            id_mascota,
            formattedFechaConsulta, // Usar la fecha formateada
            diagnostico,
            tratamiento,
            observaciones,
            veterinario,
            peso_actual,
            temperatura,
            formattedProximaCita // Usar la fecha formateada
        ]);

        res.status(201).json({ success: true, message: "Historial médico registrado exitosamente.", id: result.insertId });

    } catch (error) {
        console.error("Error al registrar historial médico:", error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
            return res.status(400).json({ success: false, message: 'Error de datos: La mascota o el veterinario no existen.' });
        }
        res.status(500).json({ success: false, message: "Error interno del servidor al registrar el historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});
// =============================================================================
// NUEVO PROCEDIMIENTO: REGISTRAR ENTRADA DE HISTORIAL MÉDICO
// =============================================================================
app.post("/medical-records/add-entry", authenticateToken, isVetOrAdmin, async (req, res) => {
    const { 
        id_mascota, 
        fecha_consulta, 
        veterinario, // id del veterinario o admin que registra
        diagnostico, 
        tratamiento, 
        observaciones, 
        peso_actual, 
        temperatura, 
        proxima_cita 
    } = req.body;

    // Validar campos requeridos
    if (!id_mascota || !fecha_consulta || !veterinario || !diagnostico || !tratamiento) {
        return res.status(400).json({ success: false, message: "Campos requeridos incompletos para el registro médico: mascota, fecha, veterinario, diagnóstico, tratamiento." });
    }

    try {
        // Verificar que la mascota exista [cite: 360]
        const [mascotaRows] = await pool.query("SELECT id_mascota FROM mascotas WHERE id_mascota = ?", [id_mascota]);
        if (mascotaRows.length === 0) {
            return res.status(400).json({ success: false, message: "ID de mascota no válido. La mascota no existe." });
        }

        // Verificar que el ID de 'veterinario' corresponda a un veterinario o administrador [cite: 361]
        const [vetUserRows] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role IN ('veterinario', 'admin')", [veterinario]);
        if (vetUserRows.length === 0) {
            return res.status(400).json({ success: false, message: "ID de veterinario no válido o no autorizado para registrar historial." });
        }

        // Insertar el nuevo historial médico [cite: 363]
        const [result] = await pool.query(
            `INSERT INTO historial_medico (id_mascota, fecha_consulta, veterinario, diagnostico, tratamiento, observaciones, peso_actual, temperatura, proxima_cita)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_mascota, fecha_consulta, veterinario, diagnostico, tratamiento, 
             observaciones || null, peso_actual || null, temperatura || null, proxima_cita || null]
        );

        // Obtener el registro recién creado para devolverlo en la respuesta [cite: 364]
        const [newRecord] = await pool.query("SELECT * FROM historial_medico WHERE id_historial = ?", [result.insertId]);
        
        res.status(201).json({ success: true, message: "Entrada de historial médico registrada correctamente.", data: newRecord[0] });
        console.log(`[MEDICAL_RECORD] Nuevo historial médico creado (ID: ${result.insertId}) para mascota ID: ${id_mascota}`);

    } catch (error) {
        console.error("Error al registrar entrada de historial médico:", error);
        // Manejo específico para errores de clave foránea [cite: 515]
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
            return res.status(400).json({ success: false, message: 'Error de datos: La mascota o el usuario (veterinario) no existen.' });
        }
        res.status(500).json({ success: false, message: "Error interno del servidor al registrar el historial médico.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});
// =============================================================================
// NUEVO PROCEDIMIENTO: PROGRAMAR CITA
// =============================================================================
app.post("/appointments/create-new", authenticateToken, async (req, res) => {
    console.log("[NEW_APPOINTMENT] Datos recibidos:", req.body);
    const { 
        id_cliente, 
        id_mascota, 
        id_servicio, 
        id_veterinario, 
        fecha, // Usamos 'fecha' como en tu tabla 'citas' 
        servicios, // Usamos 'servicios' como en tu tabla 'citas' 
        estado // Opcional, por defecto 'pendiente'
    } = req.body;

    // Validación básica de campos requeridos
    if (!id_cliente || !id_mascota || !id_servicio || !id_veterinario || !fecha || !servicios) {
        return res.status(400).json({ success: false, message: "Faltan campos obligatorios para programar la cita: cliente, mascota, servicio, veterinario, fecha, servicios." });
    }

    // Convertir la fecha a un formato adecuado para MySQL si es necesario
    // Asumimos que 'fecha' ya viene en un formato que MySQL puede interpretar directamente (ej. ISO 8601)
    const fechaCitaMySQL = new Date(fecha);
    if (isNaN(fechaCitaMySQL.getTime())) {
        return res.status(400).json({ success: false, message: "Formato de fecha de cita no válido." });
    }

    try {
        // Verificar que el cliente, mascota, servicio y veterinario existan
        const [clientRows] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND role = 'usuario'", [id_cliente]);
        if (clientRows.length === 0) {
            return res.status(400).json({ success: false, message: "ID de cliente no válido o no encontrado." });
        }

        const [vetRows] = await pool.query("SELECT id, nombre, apellido, email FROM usuarios WHERE id = ? AND role IN ('veterinario', 'admin')", [id_veterinario]);
        if (vetRows.length === 0) {
            return res.status(400).json({ success: false, message: "ID de veterinario no válido o no encontrado." });
        }
        const assignedVet = vetRows[0]; // Datos del veterinario asignado

        const [serviceRows] = await pool.query("SELECT id_servicio, nombre FROM servicios WHERE id_servicio = ?", [id_servicio]);
        if (serviceRows.length === 0) {
            return res.status(400).json({ success: false, message: "ID de servicio no válido o no encontrado." });
        }
        const servicio_nombre = serviceRows[0].nombre; // Nombre del servicio

        const [mascotaRows] = await pool.query("SELECT id_mascota, id_propietario, nombre FROM mascotas WHERE id_mascota = ?", [id_mascota]);
        if (mascotaRows.length === 0) {
            return res.status(400).json({ success: false, message: "ID de mascota no válido o no encontrado." });
        }
        const mascota_nombre = mascotaRows[0].nombre; // Nombre de la mascota

        // Verificar que la mascota pertenezca al cliente especificado
        if (mascotaRows[0].id_propietario !== id_cliente) {
            return res.status(403).json({ success: false, message: "La mascota especificada no pertenece al cliente indicado." });
        }

        // Obtener el nombre del cliente para las notificaciones
        const [clienteData] = await pool.query("SELECT nombre, apellido, email FROM usuarios WHERE id = ?", [id_cliente]);
        const cliente_nombre = clienteData.length > 0 ? `${clienteData[0].nombre} ${clienteData[0].apellido}` : 'Cliente Desconocido';
        const cliente_email = clienteData.length > 0 ? clienteData[0].email : null;

        // Insertar la nueva cita 
        const [result] = await pool.query(
            `INSERT INTO citas (id_cliente, id_servicio, id_veterinario, id_mascota, fecha, servicios, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_cliente, id_servicio, id_veterinario, id_mascota, fechaCitaMySQL, servicios, estado || 'pendiente']
        );

        const newCitaId = result.insertId;
        const [newCita] = await pool.query("SELECT * FROM citas WHERE id_cita = ?", [newCitaId]);

        // Lógica de notificaciones [cite: 416, 420]
        // Notificar al veterinario asignado sobre la nueva cita PENDIENTE
        await pool.query(
            `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
            [id_veterinario, 'cita_creada_vet', `Nueva cita PENDIENTE de ${cliente_nombre} para ${mascota_nombre} (${servicio_nombre}) el ${fecha}.`, newCitaId]
        );
        if (assignedVet.email) {
            simulateSendEmail(
                assignedVet.email,
                `Nueva Cita Pendiente - Flooky Pets`,
                `Hola Dr./Dra. ${assignedVet.nombre} ${assignedVet.apellido},\n\nSe ha solicitado una nueva cita pendiente:\n\nCliente: ${cliente_nombre}\nMascota: ${mascota_nombre}\nServicio: ${servicio_nombre}\nFecha y Hora: ${fecha}\n\nPor favor, revisa tu panel para ACEPTAR o RECHAZAR esta cita.\n\nSaludos,\nEl equipo de Flooky Pets`
            );
        }

        // Notificar al cliente que su cita está PENDIENTE
        await pool.query(
            `INSERT INTO notificaciones (id_usuario, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)`,
            [id_cliente, 'cita_creada_user', `Tu cita para ${mascota_nombre} (${servicio_nombre}) el ${fecha} ha sido solicitada y está PENDIENTE de confirmación.`, newCitaId]
        );
        if (cliente_email) {
            simulateSendEmail(
                cliente_email,
                `Confirmación de Solicitud de Cita - Flooky Pets`,
                `Hola ${cliente_nombre},\n\nHemos recibido tu solicitud de cita para:\n\nMascota: ${mascota_nombre}\nServicio: ${servicio_nombre}\nFecha y Hora: ${fecha}\nEstado: PENDIENTE\n\nTe notificaremos tan pronto como tu cita sea ACEPTADA o RECHAZADA por el veterinario.\n\nGracias por elegir Flooky Pets.`
            );
        }
        // Fin lógica de notificaciones

        res.status(201).json({ success: true, message: "Cita programada correctamente y pendiente de confirmación.", data: newCita[0] });
        console.log(`[NEW_APPOINTMENT] Nueva cita programada (ID: ${newCitaId}) para cliente ID: ${id_cliente}, mascota ID: ${id_mascota}`);

    } catch (error) {
        console.error("Error al programar nueva cita:", error);
        // Manejo específico de errores de clave foránea [cite: 515]
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
            return res.status(400).json({ success: false, message: 'Error de datos: Cliente, servicio, veterinario o mascota no existen en la base de datos.' });
        }
        res.status(500).json({ success: false, message: "Error interno del servidor al programar la cita.", error: process.env.NODE_ENV === 'development' ? error.stack : error.message });
    }
});
// =============================================================================
// RUTA PARA OBTENER CLIENTES (ROLES 'usuario')
// =============================================================================
app.get("/admin/clientes", authenticateToken, isAdmin, async (req, res) => { // Added isAdmin for security
    try {
        const [rows] = await pool.query("SELECT id, nombre, apellido, email, telefono, direccion, active FROM usuarios WHERE role = 'usuario'");
        res.status(200).json({ success: true, message: "Clientes obtenidos correctamente.", data: rows });
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener clientes." });
    }
});
// =============================================================================
// RUTA PARA OBTENER MASCOTAS POR ID DE CLIENTE
// =============================================================================
app.get("/mascotas/cliente/:id_cliente", authenticateToken, async (req, res) => {
    const { id_cliente } = req.params;
    try {
        const [rows] = await pool.query(
            "SELECT m.id_mascota, m.nombre, m.especie, m.raza, m.fecha_nacimiento, m.color, m.imagen_url, u.nombre AS nombre_propietario FROM mascotas m JOIN usuarios u ON m.id_propietario = u.id WHERE m.id_propietario = ?",
            [id_cliente]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No se encontraron mascotas para este cliente." });
        }
        res.status(200).json({ success: true, message: "Mascotas del cliente obtenidas correctamente.", data: rows });

    } catch (error) {
        console.error("Error al obtener mascotas por cliente:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener mascotas del cliente." });
    }
});
// =============================================================================
// RUTA PARA OBTENER TODOS LOS VETERINARIOS ACTIVOS
// =============================================================================
app.get("/veterinarios", authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, experiencia, universidad, horario, imagen_url FROM usuarios WHERE role = 'veterinario' AND active = 1"
        );
        res.status(200).json({ success: true, message: "Veterinarios obtenidos correctamente.", data: rows });
    } catch (error) {
        console.error("Error al obtener veterinarios:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener veterinarios." });
    }
});
// =============================================================================
// RUTA PARA CREAR UNA NUEVA CITA (ADMIN)
// =============================================================================
app.post("/admin/citas", authenticateToken, async (req, res) => {
    // Los campos que el frontend enviará en el body de la petición
    const {
        id_cliente,
        id_mascota,
        id_servicio,
        id_veterinario,
        fecha_cita, // Del frontend, se mapea a 'fecha' en la DB
        notas_adicionales, // Del frontend, se mapea a 'servicios' en la DB
        estado
    } = req.body;

    try {
        // Validación básica de los datos recibidos
        if (!id_cliente || !id_mascota || !id_servicio || !id_veterinario || !fecha_cita) {
            return res.status(400).json({ success: false, message: "Faltan campos obligatorios para crear la cita." });
        }

        // Mapeo de nombres de campos del frontend a la base de datos
        const fechaDB = fecha_cita; // 'fecha_cita' del frontend es 'fecha' en la DB
        const serviciosDB = notas_adicionales; // 'notas_adicionales' del frontend es 'servicios' en la DB

        const [result] = await pool.query(
            "INSERT INTO citas (id_cliente, id_servicio, id_veterinario, id_mascota, fecha, servicios, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id_cliente, id_servicio, id_veterinario, id_mascota, fechaDB, serviciosDB, estado]
        );

        res.status(201).json({
            success: true,
            message: "Cita creada exitosamente.",
            id_cita: result.insertId // Devuelve el ID de la nueva cita creada
        });

    } catch (error) {
        console.error("Error al crear cita:", error);

        // Mensaje de error más específico para FK (si mascota/veterinario/cliente no existen)
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
            return res.status(400).json({ success: false, message: 'Error de datos: El cliente, la mascota, el servicio o el veterinario especificado no existen.' });
        }

        res.status(500).json({ success: false, message: "Error interno del servidor al crear la cita." });
    }
});
// =============================================================================
// RUTA PARA REGISTRAR UN NUEVO HISTORIAL MÉDICO (ADMIN)
// =============================================================================
app.post("/admin/historial-medico", authenticateToken, async (req, res) => {
    // Los campos que el frontend enviará en el body de la petición
    const {
        id_mascota,
        id_veterinario,
        fecha_visita,
        diagnostico,
        tratamiento,
        notas_internas,
        peso,
        temperatura,
        observaciones_generales,
        proxima_cita
    } = req.body;

    try {
        // Validación básica de los datos recibidos
        if (!id_mascota || !id_veterinario || !fecha_visita) {
            return res.status(400).json({ success: false, message: "Faltan campos obligatorios para registrar el historial médico (Mascota, Veterinario, Fecha de Visita)." });
        }

        const [result] = await pool.query(
            "INSERT INTO historial_medico (id_mascota, id_veterinario, fecha_visita, diagnostico, tratamiento, notas_internas, peso, temperatura, observaciones_generales, proxima_cita) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id_mascota, id_veterinario, fecha_visita, diagnostico, tratamiento, notas_internas, peso, temperatura, observaciones_generales, proxima_cita]
        );

        res.status(201).json({
            success: true,
            message: "Historial médico registrado exitosamente.",
            id_historial: result.insertId // Devuelve el ID del nuevo registro creado
        });

    } catch (error) {
        console.error("Error al registrar historial médico:", error);

        // Mensaje de error más específico para FK (si mascota/veterinario no existen)
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
            return res.status(400).json({ success: false, message: 'Error de datos: La mascota o el veterinario especificado no existen.' });
        }

        res.status(500).json({ success: false, message: "Error interno del servidor al registrar el historial médico." });
    }
});
// Ruta para registrar un nuevo historial médico (para veterinarios o administradores)
app.post("/admin/historiales", authenticateToken, isVetOrAdmin, async (req, res) => {
    // ... (rest of your existing code for data extraction and validation)

    try {
        // ... (your existing Express-file-upload check if applicable)

        console.log("Valores para INSERT en historial_medico:", {
            id_mascota: id_mascota,
            veterinario: id_veterinario, // Corrected from id_veterinario to veterinario
            fechaVisitaDB: fecha_visita,
            finalDiagnostico: diagnostico,
            finalTratamiento: tratamiento,
            finalObservaciones: observaciones_generales,
            proximaCitaDB: proxima_cita
        });

        // Insertar el historial médico en la base de datos
        const [result] = await pool.query(
            `INSERT INTO historial_medico (id_mascota, veterinario, fecha_visita, diagnostico, tratamiento, observaciones_generales, proxima_cita) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                id_mascota,
                id_veterinario, // Use the variable holding the veterinarian ID
                fecha_visita,
                diagnostico,
                tratamiento,
                observaciones_generales,
                proxima_cita
            ]
        );

        // ... (rest of your existing code for success response and error handling)
    } catch (error) {
        console.error("Error al registrar historial médico:", error);
        // ... (rest of your existing error handling)
    }
});


// =============================================================================
// RUTA PARA ACTUALIZAR UN HISTORIAL MÉDICO EXISTENTE (ADMIN)
// =============================================================================
app.put("/admin/historiales/:id_historial", authenticateToken, async (req, res) => {
    const { id_historial } = req.params;
    const {
        id_mascota,
        id_veterinario,
        fecha_registro,
        diagnostico,
        tratamiento,
        observaciones,
        proxima_cita
    } = req.body;

    try {
        // Validación de campos obligatorios.
        if (!id_mascota || !id_veterinario || !fecha_registro || !diagnostico || !tratamiento) {
            return res.status(400).json({ success: false, message: "Faltan campos obligatorios para actualizar el historial médico (Mascota, Veterinario, Fecha de Registro, Diagnóstico, Tratamiento)." });
        }

        const fechaVisitaDB = new Date(fecha_registro).toISOString().slice(0, 10);
        const proximaCitaDB = proxima_cita ? new Date(proxima_cita).toISOString().slice(0, 19).replace('T', ' ') : null;

        const finalObservaciones = observaciones || null;
        const finalDiagnostico = diagnostico || null;
        const finalTratamiento = tratamiento || null;

        // *** IMPORTANTE: Revisa esta salida en la CONSOLA DE TU SERVIDOR cuando ocurra el error ***
        console.log("Valores para UPDATE en historial_medico:", {
            id_historial,
            id_mascota,
            id_veterinario,
            fechaVisitaDB,
            finalDiagnostico,
            finalTratamiento,
            finalObservaciones,
            proximaCitaDB
        });

        const [result] = await pool.query(
            "UPDATE historial_medico SET id_mascota = ?, id_veterinario = ?, fecha_visita = ?, diagnostico = ?, tratamiento = ?, observaciones_generales = ?, proxima_cita = ? WHERE id_historial = ?",
            [id_mascota, id_veterinario, fechaVisitaDB, finalDiagnostico, finalTratamiento, finalObservaciones, proximaCitaDB, id_historial]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Historial médico no encontrado." });
        }

        res.status(200).json({
            success: true,
            message: "Historial médico actualizado exitosamente."
        });

    } catch (error) {
        // *** IMPORTANTE: Revisa esta salida en la CONSOLA DE TU SERVIDOR para el error detallado ***
        console.error("Error al actualizar historial médico:", error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
            return res.status(400).json({ success: false, message: 'Error de datos: La mascota o el veterinario especificado no existen.' });
        }
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar el historial médico.",
            errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// =============================================================================
// INICIO DEL SERVIDOR Y MANEJO DE ERRORES GLOBAL
// =============================================================================

// Iniciar el servidor Express en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Middleware de manejo de errores global (DEBE SER EL ÚLTIMO app.use)
// Este middleware captura cualquier error no manejado en las rutas anteriores.
app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err); // Log del error completo en la consola del servidor
    res.status(500).json({
        success: false,
        message: "Ocurrió un error inesperado en el servidor.",
        // En desarrollo, se envía el stack trace para depuración; en producción, solo un mensaje genérico.
        error: process.env.NODE_ENV === 'development' ? err.stack : err.message
    });
});
