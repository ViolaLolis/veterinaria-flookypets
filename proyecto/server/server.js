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
  password: "12345678",
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
app.post("/clientes", (req, res) => {
  const { nombre, direccion, telefono } = req.body;
  db.query(
    "INSERT INTO clientes (nombre, direccion, telefono) VALUES (?, ?, ?)",
    [nombre, direccion, telefono],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error al agregar el cliente", error: err });
      }
      res.status(201).json({
        id_cliente: results.insertId,
        nombre,
        direccion,
        telefono,
      });
    }
  );
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
