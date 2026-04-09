import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RUTAS_POR_ROL = {
  funcionario: '/reportar',
  sgsst: '/panel-sst',
  gerencia: '/dashboard'
};

const USERS_DEMO = [
  { init: 'CR', name: 'Carlos Rodríguez', role: '👷 Funcionario Operativo', cred: 'func2026', bg: 'rgba(62,207,181,0.15)', color: '#3ecfb5' },
  { init: 'MG', name: 'María González', role: '🔒 Responsable SGSST', cred: 'sgsst2026', bg: 'rgba(201,184,120,0.15)', color: '#c9b878' },
  { init: 'GA', name: 'Gustavo Arana', role: '📊 Gerencia General', cred: 'gerencia2026', bg: 'rgba(224,92,58,0.15)', color: '#e8d89a' }
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [selUser, setSelUser]   = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [pwdLen, setPwdLen]     = useState(0);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const rol = await login(email, password);
      navigate(RUTAS_POR_ROL[rol] || '/');
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = Math.min(Math.floor(pwdLen / 3), 4);
  const strengthColors = ['', '#e05c3a', '#c9b878', '#e8d89a', '#3ecfb5'];
  const strengthLabels = ['', 'Muy corta', 'Débil', 'Moderada', 'Segura'];

  return (
    <div className="login-page">
      <div className="orb orb1"></div>
      <div className="orb orb2"></div>
      <div className="orb orb3"></div>
      <div className="grid-lines"></div>

      <div className="login-wrap">
        {/* Panel izquierdo */}
        <div className="login-left">
          <div className="ll-top">
            <div className="login-logo-wrap">
              <div className="login-logo-ring"></div>
              <div className="login-logo-ring2"></div>
              <div className="login-logo">🛡️</div>
            </div>
            <div className="ll-title">
              Seguridad física<br /><span>inteligente</span><br />para tu equipo
            </div>
            <div className="ll-sub">
              Sistema de reporte y gestión de incidentes para Evidencia Digital S.A.S. — Bogotá, Colombia.
            </div>
          </div>
          <div className="ll-stats">
            <div className="ls"><div className="ls-num">83%</div><div className="ls-lbl">Tasa de reporte</div></div>
            <div className="ls"><div className="ls-num">2.4m</div><div className="ls-lbl">Tiempo respuesta</div></div>
            <div className="ls"><div className="ls-num">12</div><div className="ls-lbl">Incidentes 2026</div></div>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="login-right">
          <div className="lr-title">Bienvenido de vuelta</div>
          <div className="lr-sub">Ingresa con tu correo institucional</div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <div className="pwd-label">Correo institucional</div>
              <input
                type="email"
                className="fc-input"
                style={{ marginBottom: 0 }}
                placeholder="correo@evidenciadigital.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="pwd-wrap">
              <div className="pwd-label">Contraseña</div>
              <div className="pwd-box">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="pwd-input"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPwdLen(e.target.value.length) }}
                  required
                />
                <button type="button" className="pwd-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              <div className="pwd-bars">
                {[0,1,2,3].map(i => (
                  <div key={i} className="pbar" style={{ background: i < pwdStrength ? strengthColors[pwdStrength] : 'var(--rim)' }} />
                ))}
              </div>
              {password && <div className="pwd-hint" style={{ color: strengthColors[pwdStrength] }}>{strengthLabels[pwdStrength]}</div>}
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-cta" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar al sistema →'}
            </button>
          </form>

          <div className="login-divider">
            <span>ACCESO RÁPIDO DEMO</span>
          </div>

          <div className="user-cards">
            {USERS_DEMO.map((u, i) => (
              <div
                key={i}
                className={`uc${selUser === i ? ' selected' : ''}`}
                onClick={() => {
                  setSelUser(i);
                  const emails = ['carlos.rodriguez@evidenciadigital.com', 'maria.gonzalez@evidenciadigital.com', 'gustavo.arana@evidenciadigital.com'];
                  setEmail(emails[i]);
                  setPassword('password123');
                  setPwdLen(11);
                }}
              >
                <div className="uc-av" style={{ background: u.bg, color: u.color }}>{u.init}</div>
                <div className="uc-info">
                  <div className="uc-name">{u.name}</div>
                  <div className="uc-role">{u.role}</div>
                  <div className="uc-cred">{u.cred}</div>
                </div>
                <div className="uc-check">{selUser === i ? '✓' : ''}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <Link to="/registro" className="login-link">¿No tienes cuenta? Regístrate aquí</Link>
          </div>
          <div className="login-hint">Entorno seguro · Evidencia Digital S.A.S. v1.0</div>
        </div>
      </div>
    </div>
  );
}
