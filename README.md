# 🛡️ NeoCity Shield

Sistema de información web para el reporte y gestión de incidentes de seguridad física ocupacional.

**Beneficiario:** Evidencia Digital S.A.S.
**Universidad:** El Bosque
**Trabajo de grado:** 2025–2026
**Equipo:** Daniel Moreno · Ricardo De León · Christiam Caita
**Director:** Cesar Ramiro Beltrán Hernández

---

## 📋 Descripción

NeoCity Shield es una plataforma web que reemplaza los procesos manuales e informales de reporte de incidentes de seguridad física en Evidencia Digital S.A.S. por un canal institucional centralizado, trazable y accesible desde cualquier dispositivo.

La solución atiende directamente la problemática identificada: una tasa de reporte al SGSST del 50%, información fragmentada en WhatsApp y Excel, y ausencia de procesos estandarizados que dificultan el cumplimiento del Decreto 1072 de 2015.

---

## 🚀 Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Inteligencia Artificial | OpenAI GPT-4o |
| Infraestructura | AWS (EC2 + RDS) |
| Control de versiones | GitHub |
| Arquitectura | MVC (Modelo-Vista-Controlador) |

---

## 📦 Módulos del sistema

- 🔐 **Autenticación y roles** — Acceso diferenciado para funcionario, SGSST y Gerencia
- 📋 **Reporte de incidentes** — Formulario con captura opcional de geolocalización GPS/WPS
- 🔒 **Panel SGSST** — Gestión y seguimiento de casos con alertas automáticas de 48 horas
- 📊 **Dashboard gerencial** — Indicadores, métricas y tendencias en tiempo real
- 🤖 **NeoBot** — Chatbot con IA generativa (OpenAI GPT-4o) para orientación ante incidentes

---

## 🗂️ Estructura del repositorio
```
neocity-shield/
├── /gestion-proyecto        → Documentación de gestión del proyecto
│   ├── actas/
│   ├── cronograma/
│   └── matrices/
│
└── /producto
    ├── /backend             → API REST Node.js + Express
    │   ├── /config          → Conexión BD y scripts SQL
    │   ├── /models          → Modelos de datos (PostgreSQL)
    │   ├── /controllers     → Lógica de negocio
    │   ├── /routes          → Endpoints de la API
    │   ├── /middleware      → Autenticación JWT y roles
    │   └── server.js        → Punto de entrada del servidor
    │
    └── /frontend            → Aplicación React.js
        └── /src
            ├── /components  → Vistas (Login, Reporte, SST, Dashboard, Chatbot)
            ├── /context     → Estado global de sesión
            └── /services    → Llamadas al backend
```

---

## 🏃 Cómo ejecutar el proyecto

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configura tus variables de entorno
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🗓️ Cronograma del proyecto

| Sprint | Fase | Fechas |
|---|---|---|
| Sprint 1 | Análisis | 02/02/2026 – 01/03/2026 |
| Sprint 2 | Análisis y Diseño | 02/03/2026 – 29/03/2026 |
| — | Receso | 30/03/2026 – 04/04/2026 |
| Sprint 3 | Diseño y Primer Incremento | 05/04/2026 – 03/05/2026 |
| Sprint 4 ⭐ | Construcción — HITO P1 | 04/05/2026 – 04/05/2026 |
| Sprint 5 | Pruebas e Implementación | 04/05/2026 – 07/06/2026 |
| Sprint 6 ⭐ | Cierre — HITO P2 | 08/06/2026 – 13/07/2026 |

---

## 📐 Normas y estándares aplicados

- **IEEE 830** — Especificación de requerimientos
- **IEEE 829** — Documentación de pruebas
- **ISO/IEC 27001:2022** — Seguridad de la información
- **ISO 45001:2022** — Seguridad y salud en el trabajo
- **OWASP Top 10** — Seguridad en aplicaciones web
- **Ley 1581 de 2012** — Protección de datos personales (Colombia)
- **Decreto 1072 de 2015** — SG-SST Colombia
