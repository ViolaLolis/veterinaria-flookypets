const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error obteniendo usuarios:", err);
      return res.status(500).json({ error: "Error obteniendo datos" });
    }
    res.json(results);
  });
});

// Ruta para actualizar estado de usuario
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
