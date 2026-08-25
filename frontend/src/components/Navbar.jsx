import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ruta "de inicio" según el rol del usuario
const RUTA_INICIO_POR_ROL = {
  funcionario: '/reportar',
  sgsst:       '/panel-sst',
  gerencia:    '/dashboard'
};

// Links de navegación disponibles según el rol
const LINKS_POR_ROL = {
  funcionario: [
    { path: '/reportar',       label: 'Reportar',       icon: '📝' },
    { path: '/notificaciones', label: 'Notificaciones', icon: '🔔' },
    { path: '/perfil',         label: 'Mi Perfil',      icon: '👤' },
  ],
  sgsst: [
    { path: '/panel-sst',      label: 'Panel SST',      icon: '🔒' },
    { path: '/dashboard',      label: 'Dashboard',      icon: '📊' },
    { path: '/mapa',           label: 'Mapa',           icon: '🗺️' },
    { path: '/notificaciones', label: 'Notificaciones', icon: '🔔' },
    { path: '/perfil',         label: 'Mi Perfil',      icon: '👤' },
  ],
  gerencia: [
    { path: '/dashboard',      label: 'Dashboard',      icon: '📊' },
    { path: '/mapa',           label: 'Mapa',           icon: '🗺️' },
    { path: '/notificaciones', label: 'Notificaciones', icon: '🔔' },
    { path: '/perfil',         label: 'Mi Perfil',      icon: '👤' },
  ],
};

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate            = useNavigate();
  const location             = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra el menú móvil cada vez que cambiamos de vista
  useEffect(() => { setMenuAbierto(false); }, [location.pathname]);

  if (!usuario) return null;

  const links       = LINKS_POR_ROL[usuario.rol] || [];
  const rutaInicio  = RUTA_INICIO_POR_ROL[usuario.rol] || '/';
  const enInicio    = location.pathname === rutaInicio;
  const paginaActual = links.find(l => l.path === location.pathname)?.label || 'Inicio';

  const iniciales = usuario?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'US';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAtras = () => {
    // Si hay historial de navegación dentro de la app, retrocede.
    // Si el usuario entró directo (sin historial), lo llevamos a su inicio.
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(rutaInicio);
    }
  };

  return (
    <>
      <nav className="navbar">
        {/* Botón atrás — solo visible si no estamos en la vista de inicio del rol */}
        {!enInicio && (
          <button className="nav-back" onClick={handleAtras} aria-label="Volver">
            ← <span className="nav-back-txt">Atrás</span>
          </button>
        )}

        <Link to={rutaInicio} className="nav-logo">
          <div className="nav-shield">🛡️</div>
          <span className="nav-brand">NeoCity Shield</span>
        </Link>

        {/* Breadcrumb simple: Inicio / Vista actual */}
        <span className="nav-breadcrumb">
          <Link to={rutaInicio}>Inicio</Link>
          {!enInicio && <> <span className="nav-breadcrumb-sep">/</span> {paginaActual}</>}
        </span>

        {/* Links de escritorio */}
        <div className="nav-links">
          {links.map(l => (
            <button
              key={l.path}
              className={`nl ${location.pathname === l.path ? 'active' : ''}`}
              onClick={() => navigate(l.path)}
            >
              {l.icon} {l.label}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-av" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
            {iniciales}
          </div>
          <span className="nav-name">{usuario.nombre}</span>
          <button className="nav-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>

          {/* Botón hamburguesa — solo visible en móvil */}
          <button
            className={`nav-hamburger ${menuAbierto ? 'abierto' : ''}`}
            onClick={() => setMenuAbierto(v => !v)}
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Menú móvil (drawer) */}
      {menuAbierto && (
        <div className="nav-drawer-overlay" onClick={() => setMenuAbierto(false)}>
          <div className="nav-drawer" onClick={e => e.stopPropagation()}>
            <div className="nav-drawer-user">
              <div className="nav-av" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                {iniciales}
              </div>
              <div>
                <div className="nav-drawer-nombre">{usuario.nombre}</div>
                <div className="nav-drawer-rol">{usuario.rol}</div>
              </div>
            </div>

            <div className="nav-drawer-links">
              {links.map(l => (
                <button
                  key={l.path}
                  className={`nav-drawer-link ${location.pathname === l.path ? 'active' : ''}`}
                  onClick={() => navigate(l.path)}
                >
                  <span>{l.icon}</span> {l.label}
                </button>
              ))}
            </div>

            <button className="nav-drawer-logout" onClick={handleLogout}>
              🚪 Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}
