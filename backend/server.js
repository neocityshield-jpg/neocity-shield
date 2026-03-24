require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const app     = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/incidentes', require('./routes/incidenteRoutes'));
app.use('/api/sst',        require('./routes/sstRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/chatbot',    require('./routes/chatbotRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', app: 'NeoCity Shield' }));

// RUTA TEMPORAL
app.get('/api/crear-usuarios', async (req, res) => {
  const pool = require('./config/db');
  const usuarios = [
    { nombre: 'Administrador', email: 'admin@evidenciadigital.com', password: 'Admin2026', rol: 'gerencia' },
    { nombre: 'Funcionario Demo', email: 'funcionario@evidenciadigital.com', password: 'Admin2026', rol: 'funcionario' },
    { nombre: 'SGSST Demo', email: 'sgsst@evidenciadigital.com', password: 'Admin2026', rol: 'sgsst' }
  ];
  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query('DELETE FROM usuarios WHERE email = $1', [u.email]);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1,$2,$3,$4)`,
      [u.nombre, u.email, hash, u.rol]
    );
  }
  res.json({ ok: true, mensaje: 'Usuarios creados exitosamente' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 NeoCity Shield backend corriendo en puerto ${PORT}`));
