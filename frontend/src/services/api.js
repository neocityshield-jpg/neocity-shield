import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login:    (data) => API.post('/auth/login', data),
  perfil:   ()     => API.get('/auth/perfil'),
  registro: (data) => API.post('/auth/registro', data)
};

export const incidenteService = {
  crear:          (data)   => API.post('/incidentes', data),
  listarTodos:    (params) => API.get('/incidentes', { params }),
  misReportes:    ()       => API.get('/incidentes/mis-reportes'),
  detalle:        (id)     => API.get(`/incidentes/${id}`),
  sinSeguimiento: ()       => API.get('/incidentes/alertas/sin-seguimiento')
};

export const sstService = {
  registrarSeguimiento: (data) => API.post('/sst/seguimiento', data),
  historial:            (id)   => API.get(`/sst/historial/${id}`)
};

export const dashboardService = {
  indicadores: () => API.get('/dashboard/indicadores'),
  mapa:        () => API.get('/dashboard/mapa')
};

export const chatbotService = {
  enviarMensaje: (data) => API.post('/chatbot/mensaje', data)
};

export default API;
