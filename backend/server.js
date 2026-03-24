// RUTA TEMPORAL - borrar después
const bcrypt = require('bcryptjs');
app.get('/api/crear-admin', async (req, res) => {
  const hash = await bcrypt.hash('Admin2026', 10);
  const pool = require('./config/db');
  await pool.query('DELETE FROM usuarios WHERE email = $1', ['admin@evidenciadigital.com']);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1,$2,$3,$4)`,
    ['Administrador', 'admin@evidenciadigital.com', hash, 'gerencia']
  );
  res.json({ ok: true, hash });
});
