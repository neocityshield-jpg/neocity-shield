require('dotenv').config();
const express = require('express');
const cors    = require('cors');
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 NeoCity Shield backend corriendo en puerto ${PORT}`));
