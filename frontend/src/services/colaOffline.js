import API from './api';

const KEY = 'reportes-pendientes';

export const leerPendientes = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
};

export const guardarPendiente = (reporte) => {
  const lista = leerPendientes();
  lista.push(reporte);
  localStorage.setItem(KEY, JSON.stringify(lista));
};

// Reenvía los reportes guardados. Devuelve cuántos se enviaron.
export const sincronizarPendientes = async () => {
  if (!localStorage.getItem('token')) return 0;
  const pendientes = leerPendientes();
  if (pendientes.length === 0) return 0;

  const sinEnviar = [];
  let enviados = 0;

  for (let i = 0; i < pendientes.length; i++) {
    try {
      await API.post('/incidentes', pendientes[i]);
      enviados++;
    } catch (error) {
      if (!error.response) {
        // Sigue sin conexión: conserva este y los demás para el próximo intento
        sinEnviar.push(...pendientes.slice(i));
        break;
      }
      // Si el servidor lo rechazó (4xx/5xx) se descarta para no reintentar eternamente
    }
  }

  localStorage.setItem(KEY, JSON.stringify(sinEnviar));
  return enviados;
};
