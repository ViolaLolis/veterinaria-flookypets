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

  // Resto de tu lógica de registro...
});
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
