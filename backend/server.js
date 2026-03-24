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
app.get('/api/crear-admin', async (req, res) => {
  const pool = require('./config/db');
  const hash = await bcrypt.hash('Admin2026', 10);
  await pool.query('DELETE FROM usuarios WHERE email = $1', ['admin@evidenciadigital.com']);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1,$2,$3,$4)`,
    ['Administrador', 'admin@evidenciadigital.com', hash, 'gerencia']
  );
  res.json({ ok: true, hash });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 NeoCity Shield backend corriendo en puerto ${PORT}`));
