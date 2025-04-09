const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise'); // o tu conexión actual

async function migrarContraseñas() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bocanegra_bd'
  });

  const [usuarios] = await connection.execute('SELECT id, password FROM usuarios');

  for (const usuario of usuarios) {
    const hash = await bcrypt.hash(usuario.password, 10);
    await connection.execute('UPDATE usuarios SET password = ? WHERE id = ?', [hash, usuario.id]);
  }

  console.log('Contraseñas encriptadas exitosamente ✅');
  await connection.end();
}

migrarContraseñas();
