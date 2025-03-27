const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json()); // Permite recibir JSON en las peticiones

// Conexión a MySQL
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'BocanegraDB' // Asegúrate de que esta BD exista
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('🚀 Servidor funcionando correctamente 🚀');
});

// Ruta para registrar usuario
app.post('/api/registro', (req, res) => {
  console.log('📥 Datos recibidos:', req.body); // Verificar datos en consola

  const { nombre, fecha_nacimiento, ciudad, correo, contrasena } = req.body;

  if (!nombre || !fecha_nacimiento || !ciudad || !correo || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const sql = 'INSERT INTO usuarios (nombre, fecha_nacimiento, ciudad, correo, contrasena) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nombre, fecha_nacimiento, ciudad, correo, contrasena], (err, result) => {
    if (err) {
      console.error('❌ Error al registrar usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.status(201).json({ mensaje: '✅ Usuario registrado correctamente' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
