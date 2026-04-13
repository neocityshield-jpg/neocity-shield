# NeoCity Shield

> Sistema de información web para el reporte, gestión e investigación de incidentes de seguridad física ocupacional — **en producción**.

**Beneficiario:** Evidencia Digital S.A.S.
**Universidad:** El Bosque · Trabajo de grado 2025–2026
**Equipo:** Daniel Moreno · Ricardo De León · Christiam Caita
**Director:** Cesar Ramiro Beltrán Hernández

---

## Links del sistema

| | URL |
|---|---|
| **App en producción** | https://neocity-shield.vercel.app |
| **Backend API** | https://neocity-shield-production.up.railway.app |
| **Mapa de incidentes** | https://neocity-shield.vercel.app/mapa |
| **Repositorio** | https://github.com/neocityshield-jpg/neocity-shield |

---

## Descripción

NeoCity Shield reemplaza los procesos manuales e informales de reporte de incidentes de seguridad física en Evidencia Digital S.A.S. por un canal institucional centralizado, trazable y accesible desde cualquier dispositivo con navegador web.

**Problemática atendida:**
- Tasa de reporte al SGSST del 50%
- Información fragmentada en WhatsApp y Excel sin trazabilidad
- Ausencia de procesos estandarizados
- Incumplimiento del Decreto 1072 de 2015

---

## Tecnologías

| Capa | Tecnología | Plataforma |
|---|---|---|
| Frontend | React.js 18 + React Router 6 | Vercel |
| Backend | Node.js + Express.js | Railway |
| Base de datos | PostgreSQL 17 | Railway |
| Inteligencia Artificial | OpenAI GPT-4o | API externa |
| Mapas | Leaflet.js + OpenStreetMap | — |
| Autenticación | JWT + bcryptjs | — |
| Exportación | jsPDF + AutoTable | — |
| Arquitectura | MVC | — |

---

## Módulos del sistema

### Autenticación y roles
- Login seguro con JWT de 8 horas
- Tres roles diferenciados: **Funcionario**, **SGSST**, **Gerencia**
- Registro restringido a correos `@evidenciadigital.com`

### Reporte de incidentes (Funcionario)
- Formulario en 4 pasos con barra de progreso visual
- 20 tipos de incidente en 4 categorías (ARL Sura / ISO 45001)
- Captura GPS con validación de perímetro de 100 metros
- Dirección exacta vía reverse geocoding (Nominatim)
- Mapa interactivo en tiempo real (Leaflet)

### Panel SGSST
- Vista centralizada de todos los incidentes
- Buscador por funcionario, tipo o descripción
- Filtros por estado y rango de fechas
- Historial completo de seguimientos con línea de tiempo
- Indicador de tiempo de respuesta por caso
- Alerta automática para casos sin atención en 48 horas
- Exportar caso individual a PDF
- Módulo de investigación: causa raíz + acciones correctivas y preventivas

### Dashboard gerencial
- KPIs en tiempo real: total, pendientes, en gestión, cerrados
- Gráfica de tendencia por mes
- Distribución por tipo de incidente
- Mapa de calor de incidentes en Bogotá
- Exportar reporte mensual a PDF

### NeoBot — Chatbot IA
- Asistente conversacional powered by OpenAI GPT-4o
- Orientación inmediata ante hurtos, caídas, agresiones y amenazas
- Sugerencias rápidas predefinidas
- Disponible en todas las pantallas del sistema
- Historial de conversaciones en base de datos

### Perfil del funcionario
- Estadísticas personales de reportes
- Historial completo de incidentes propios
- Configuración de notificaciones

### Notificaciones
- Sistema de notificaciones internas
- Alertas cuando hay nuevos incidentes o cambios de estado

### Modo offline
- Service Worker para funcionamiento sin conexión
- Sincronización automática al recuperar internet

---

## Estructura del repositorio

## 📁 Estructura del Repositorio - NeoCity Shield

```bash
neocity-shield/
├── backend/
│   ├── config/
│   │   └── db.js                  # Conexión PostgreSQL con SSL
│   │
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Incidente.js
│   │   └── Seguimiento.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── incidenteController.js
│   │   ├── sstController.js
│   │   ├── dashboardController.js
│   │   └── chatbotController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── incidenteRoutes.js
│   │   ├── sstRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── chatbotRoutes.js
│   │   ├── notificacionRoutes.js
│   │   └── investigacionRoutes.js
│   │
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── sw.js                  # Service Worker (modo offline)
    │
    └── src/
        ├── index.js
        ├── index.css              # Sistema de diseño completo
        ├── App.jsx                # Rutas y control de acceso
        │
        ├── context/
        │   └── AuthContext.jsx
        │
        ├── services/
        │   └── api.js
        │
        └── components/
            ├── Login.jsx
            ├── Registro.jsx
            ├── FormReporte.jsx
            ├── PanelSST.jsx
            ├── Dashboard.jsx
            ├── MapaCalor.jsx
            ├── Chatbot.jsx
            ├── Notificaciones.jsx
            ├── MiPerfil.jsx
            └── Investigacion.jsx
```

## Variables de entorno

### Backend (Railway)
```env
DB_HOST       = postgres.railway.internal
DB_USER       = postgres
DB_PASSWORD   = **********
DB_NAME       = railway
DB_PORT       = 5432
JWT_SECRET    = **********
PORT          = 3001
OPENAI_API_KEY = **********
```

### Frontend (Vercel)
```env
REACT_APP_API_URL = https://neocity-shield-production.up.railway.app/api
```

---

## Cómo ejecutar localmente

### Backend
```bash
cd backend
npm install
cp .env.example .env  
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Cronograma

| Sprint | Fase | Fechas | Estado |
|---|---|---|---|
| Sprint 1 | Análisis | 02/02/2026 – 01/03/2026 | ✅ Completado |
| Sprint 2 | Análisis y Diseño | 02/03/2026 – 29/03/2026 | ✅ Completado |
| — | Receso | 30/03/2026 – 04/04/2026 | — |
| Sprint 3 | Diseño y Primer Incremento | 05/04/2026 – 03/05/2026 | 🔧 En curso |
| Sprint 4 ⭐ | Construcción — **HITO P1** | 04/05/2026 | ⏳ Próximo |
| Sprint 5 | Pruebas e Implementación | 04/05/2026 – 07/06/2026 | ⏳ |
| Sprint 6 ⭐ | Cierre — **HITO P2** | 08/06/2026 – 13/07/2026 | ⏳ |

---

## Modelo de datos

| Tabla | Descripción |
|---|---|
| `usuarios` | Funcionarios con rol y credenciales |
| `incidentes` | Reportes con geolocalización y estado |
| `seguimientos` | Historial de gestión por caso |
| `investigaciones` | Causa raíz y acciones correctivas |
| `notificaciones` | Alertas internas del sistema |
| `chatbot_sesiones` | Historial de conversaciones con NeoBot |
| `push_suscripciones` | Suscripciones a notificaciones push |

---

## Normas y estándares aplicados

| Norma | Aplicación |
|---|---|
| Decreto 1072 de 2015 | SG-SST Colombia — registro y seguimiento de incidentes |
| ISO 45001:2022 | Sistema de gestión de seguridad y salud en el trabajo |
| ISO/IEC 27001:2022 | Seguridad de la información y control de accesos |
| IEEE 830 | Especificación de requerimientos de software |
| IEEE 829 | Documentación de pruebas |
| OWASP Top 10 | Seguridad en aplicaciones web |
| Ley 1581 de 2012 | Protección de datos personales — Colombia |
| ARL Sura / UPB | Clasificación de tipos de incidente laboral |

---

## Estado Actual del Sistema

El sistema **NeoCity Shield** se encuentra en un entorno productivo, con los siguientes módulos implementados:

### Infraestructura y Despliegue
- Backend desplegado en Railway
- Base de datos PostgreSQL en producción (con datos de prueba)
- Frontend desplegado en Vercel

### Autenticación y Usuarios
- Sistema de login con 3 roles funcionales
- Perfil personalizado del funcionario

### Gestión de Incidentes
- Formulario de reporte con GPS y mapa interactivo
- Panel SGSST con buscador, filtros e historial
- Módulo de investigación de incidentes

### Analítica y Visualización
- Dashboard con KPIs y exportación a PDF
- Mapa de calor de incidentes en Bogotá

### Inteligencia Artificial
- Chatbot NeoBot integrado con OpenAI (GPT-4o)

### Experiencia de Usuario
- Modo offline (Service Worker - PWA)
- Diseño responsivo (móvil y desktop)
---

*NeoCity Shield — Evidencia Digital S.A.S. — Universidad El Bosque — 2026*
