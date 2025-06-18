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
    password: process.env.DB_PASSWORD || "", // Revertido al valor por defecto proporcionado previamente
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

    if (!token) return res.status(401).json({ success: false, message: "Acceso denegado. No se proporcionó token." }); // Si no hay token, Unauthorized

    // Verifica el token usando la clave secreta
    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Token inválido o expirado." }); // Si el token es inválido o expiró, Forbidden
        req.user = user; // Guarda la información del usuario decodificada en req.user
        next(); // Continúa con la siguiente función middleware o ruta
    });
};

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Acceso denegado. Se requiere rol de administrador." }); // Si el usuario no es admin, Forbidden
    }
    next(); // Continúa si es admin
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
        res.status(500).json({ message: "Error en el servidor" });
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
        res.status(500).json({ message: "Error al registrar usuario" });
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
            message: "Error en el servidor"
        });
    }
});

// =============================================
// RUTAS DEL PANEL DE ADMINISTRADOR (MÁS ESPECÍFICAS PRIMERO)
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
        res.status(500).json({ success: false, message: "Error al obtener estadísticas" });
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
            message: "Error al obtener administradores"
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
            message: "Error al crear administrador"
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
            message: "Error al actualizar administrador"
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
            message: "Error al eliminar administrador"
        });
    }
});


// ### **GESTIÓN DE VETERINARIOS**

// Obtener todos los veterinarios
app.get("/usuarios/veterinarios", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [vets] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE role = 'veterinario'"
        );
        res.json({ success: true, data: vets }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al obtener veterinarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener veterinarios" });
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
            "SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({ success: true, message: "Veterinario creado correctamente", data: newVet[0] }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al crear veterinario:", error);
        res.status(500).json({ success: false, message: "Error al crear veterinario" });
    }
});

// Actualizar veterinario
app.put("/usuarios/veterinarios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion } = req.body; // Email y password no se actualizan aquí

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

        // Actualizar datos del veterinario
        await pool.query(
            "UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, direccion = ? WHERE id = ? AND role = 'veterinario'",
            [nombre, apellido, telefono, direccion, id]
        );

        // Obtener el veterinario actualizado para devolverlo en la respuesta
        const [updatedVet] = await pool.query(
            "SELECT id, nombre, apellido, email, telefono, direccion FROM usuarios WHERE id = ?",
            [id]
        );

        res.json({ success: true, message: "Veterinario actualizado correctamente", data: updatedVet[0] }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al actualizar veterinario:", error);
        res.status(500).json({ success: false, message: "Error al actualizar veterinario" });
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
                success: false, // Añadido
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
                success: false, // Añadido
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

        res.status(500).json({ success: false, message: "Error al eliminar veterinario" });
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
        res.status(500).json({ success: false, message: "Error al obtener servicios" });
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
        res.status(500).json({ success: false, message: "Error al crear servicio" });
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
        res.status(500).json({ success: false, message: "Error al actualizar servicio" });
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

        res.status(500).json({ success: false, message: "Error al eliminar servicio" });
    }
});

// ### **GESTIÓN DE USUARIOS REGULARES**

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
        res.json({ success: true, data: users }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener usuarios" });
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
        res.status(500).json({ success: false, message: "Error al cambiar estado de usuario" });
    }
});

// ### **VISUALIZACIÓN DE CITAS**

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
        res.json({ success: true, data: appointments }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).json({ success: false, message: "Error al obtener citas" });
    }
});

// ### **VISUALIZACIÓN DE HISTORIALES MÉDICOS**

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
        res.json({ success: true, data: records }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al obtener historiales médicos:", error);
        res.status(500).json({ success: false, message: "Error al obtener historiales médicos" });
    }
});

// =============================================
// RUTAS DE PERFIL DE USUARIO INDIVIDUAL (MÁS GENERALES AL FINAL)
// =============================================

/**
 * OBTENER DETALLES DE UN USUARIO POR ID
 * GET /usuarios/:id
 * Esta ruta permite a un usuario autenticado obtener sus propios datos de perfil.
 * Un administrador también podría usarla para obtener los datos de cualquier usuario.
 */
app.get("/usuarios/:id", authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id); // ID del usuario solicitado
    const authenticatedUserId = req.user.id; // ID del usuario que hace la solicitud (del token)
    const authenticatedUserRole = req.user.role; // Rol del usuario que hace la solicitud

    // Seguridad: Permite al propio usuario acceder a su perfil o a un admin acceder a cualquier perfil
    if (userId !== authenticatedUserId && authenticatedUserRole !== 'admin') {
        return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permiso para ver este perfil." });
    }

    try {
        const [users] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, role
             FROM usuarios
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error("Error al obtener perfil de usuario por ID:", error);
        res.status(500).json({ success: false, message: "Error al obtener datos del perfil." });
    }
});

/**
 * ACTUALIZAR DETALLES DE UN USUARIO POR ID
 * PUT /usuarios/:id
 * Permite a un usuario actualizar su propio perfil (no cambia rol ni email)
 * Los administradores también pueden usarla para actualizar usuarios.
 */
app.put("/usuarios/:id", authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    const authenticatedUserId = req.user.id;
    const authenticatedUserRole = req.user.role;
    const { nombre, apellido, telefono, direccion } = req.body; // No se permite actualizar email ni password directamente aquí.

    // Seguridad: Permite al propio usuario actualizar su perfil o a un admin actualizar cualquier perfil
    if (userId !== authenticatedUserId && authenticatedUserRole !== 'admin') {
        return res.status(403).json({ success: false, message: "Acceso denegado. No tienes permiso para actualizar este perfil." });
    }

    if (!nombre || !telefono) {
        return res.status(400).json({ success: false, message: "Nombre y teléfono son requeridos." });
    }

    try {
        const [result] = await pool.query(
            `UPDATE usuarios
             SET nombre = ?, apellido = ?, telefono = ?, direccion = ?
             WHERE id = ?`,
            [nombre, apellido, telefono, direccion, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado o no se pudo actualizar." });
        }

        // Recuperar los datos actualizados para enviar al frontend
        const [updatedUser] = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, direccion, role
             FROM usuarios
             WHERE id = ?`,
            [userId]
        );

        res.json({ success: true, message: "Perfil actualizado correctamente.", data: updatedUser[0] });

    } catch (error) {
        console.error("Error al actualizar perfil de usuario:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al actualizar perfil." });
    }
});

// Ruta para obtener citas de hoy (asumiendo que es para un veterinario logueado)
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
            [today, req.user.id] // Filtra por el ID del veterinario logueado
        );

        res.json({ success: true, data: citas }); // Respuesta estandarizada
    } catch (error) {
        console.error("Error al obtener citas de hoy:", error);
        res.status(500).json({ success: false, message: "Error al obtener citas" });
    }
});

// Rutas de estadísticas para gráficos
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
        res.json({ success: true, data: results }); // Respuesta estandarizada
    } catch (error) {
        console.error('Error al obtener citas por mes:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

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
        res.json({ success: true, data: results }); // Respuesta estandarizada
    } catch (error) {
        console.error('Error al obtener servicios populares:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Tarea programada para limpiar tokens de recuperación de contraseña expirados cada hora
setInterval(async () => {
    try {
        await pool.query(
            "UPDATE usuarios SET reset_token = NULL, reset_token_expires = NULL WHERE reset_token_expires < NOW()"
        );
        // console.log('Tokens de recuperación expirados limpiados.');
    } catch (err) {
        console.error('Error limpiando tokens expirados:', err);
    }
}, 3600000); // 3600000 ms = 1 hora
