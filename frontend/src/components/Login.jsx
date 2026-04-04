import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RUTAS_POR_ROL = {
  funcionario: '/reportar',
  sgsst:       '/panel-sst',
  gerencia:    '/dashboard'
};

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const rol = await login(form.email, form.password);
      navigate(RUTAS_POR_ROL[rol] || '/');
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow1"></div>
      <div className="login-glow2"></div>

      <div className="login-card">
        <div className="login-avatar">🛡️</div>
        <h2 className="login-title">NeoCity Shield</h2>
        <p className="login-sub">Acceso seguro al sistema</p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <span className="input-icon">✉️</span>
            <input
              type="email"
              placeholder="Correo institucional"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="input-box">
            <span className="input-icon">🔒</span>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Contraseña"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <span
              className="input-toggle"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? '🙈' : '👁️'}
            </span>
          </div>

          <div className="login-row">
            <label className="remember">
              <input type="checkbox" /> Recordarme
            </label>
            <Link to="/registro" className="login-link">¿No tienes cuenta?</Link>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
