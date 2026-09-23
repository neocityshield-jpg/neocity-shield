const pool = require('../config/db');
const ExamenOcupacional = require('../models/ExamenOcupacional');
const Usuario = require('../models/Usuario');

async function ejecutarRecordatorioExamenes() {
  const examenes = await ExamenOcupacional.obtenerProximosAVencer();

  if (examenes.length === 0) {
    console.log('🩺 Recordatorio de exámenes: nada pendiente hoy.');
    return { notificados: 0 };
  }

  for (const ex of examenes) {
    const titulo = ex.estado_vigencia === 'vencido'
      ? 'Tu examen ocupacional está vencido'
      : 'Tu examen ocupacional está por vencer';

    const mensaje = ex.estado_vigencia === 'vencido'
      ? `Tu examen de tipo "${ex.tipo_examen}" venció el ${new Date(ex.fecha_proximo).toLocaleDateString('es-CO')}. Por favor agenda tu cita y reporta el resultado en la app.`
      : `Tu examen de tipo "${ex.tipo_examen}" vence el ${new Date(ex.fecha_proximo).toLocaleDateString('es-CO')}. Agenda tu cita con tiempo.`;

    await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES ($1, $2, $3)`,
      [ex.usuario_id, titulo, mensaje]
    );

    await ExamenOcupacional.marcarRecordatorioEnviado(ex.id);
  }

  const equipoSGSST = await Usuario.listarPorRol('sgsst');
  const vencidos = examenes.filter(e => e.estado_vigencia === 'vencido').length;
  const porVencer = examenes.length - vencidos;

  for (const sgsst of equipoSGSST) {
    await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES ($1, $2, $3)`,
      [
        sgsst.id,
        'Resumen diario de exámenes ocupacionales',
        `Hay ${vencidos} examen(es) vencido(s) y ${porVencer} próximo(s) a vencer. Revisa el módulo de Exámenes.`
      ]
    );
  }

  console.log(`🩺 Recordatorio de exámenes: ${examenes.length} empleado(s) notificado(s), ${equipoSGSST.length} SGSST avisado(s).`);
  return { notificados: examenes.length };
}

module.exports = { ejecutarRecordatorioExamenes };
