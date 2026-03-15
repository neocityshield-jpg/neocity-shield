const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const Usuario = {

  async crear({ nombre, email, password, rol }) {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol`,
      [nombre, email, hash, rol]
    );
    return result.rows[0];
  },

  async buscarPorEmail(email) {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE',
      [email]
    );
    return result.rows[0];
  },

  async buscarPorId(id) {
    const result = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async verificarPassword(passwordPlano, passwordHash) {
    return bcrypt.compare(passwordPlano, passwordHash);
  }
};

module.exports = Usuario;
