import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RUTAS_POR_ROL = {
  funcionario: '/reportar',
  sgsst:       '/panel-sst',
  gerencia:    '/dashboard'
};

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);
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
    <div className="login-container">
      <div className="login-card">
        <h1>🛡️ NeoCity Shield</h1>
        <p>Sistema de reporte de incidentes — Evidencia Digital S.A.S.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo institucional"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
