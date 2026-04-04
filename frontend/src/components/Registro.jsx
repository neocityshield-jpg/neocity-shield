import { useState } from 'react';
import { authService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Registro() {
  const [form, setForm]         = useState({ nombre: '', email: '', password: '', confirmar: '', rol: 'funcionario' });
  const [error, setError]       = useState('');
  const [exito, setExito]       = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.endsWith('@evidenciadigital.com')) {
      setError('Solo se permiten correos @evidenciadigital.com');
      return;
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setCargando(true);
    try {
      await authService.registro({
        nombre:   form.nombre,
        email:    form.email,
        password: form.password,
        rol:      form.rol
      });
      setExito(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setCargando(false);
    }
  };

  if (exito) return (
    <div className="login-page">
      <div className="login-glow1"></div>
      <div className="login-glow2"></div>
      <div className="login-card" style={{textAlign:'center'}}>
        <div style={{fontSize:'52px',marginBottom:'16px'}}>✅</div>
        <h2 className="login-title">¡Cuenta creada!</h2>
        <p className="login-sub">Redirigiendo al login...</p>
      </div>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-glow1"></div>
      <div className="login-glow2"></div>

      <div className="login-card">
        <div className="login-avatar">🛡️</div>
        <h2 className="login-title">Crear cuenta</h2>
        <p className="login-sub">Solo correos @evidenciadigital.com</p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>

          <div className="input-box">
            <span className="input-icon">✉️</span>
            <input
              type="email"
              placeholder="correo@evidenciadigital.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="input-box">
            <span className="input-icon">🏷️</span>
            <select
              value={form.rol}
              onChange={e => setForm({ ...form, rol: e.target.value })}
              className="input-select"
            >
              <option value="funcionario">👷 Funcionario</option>
              <option value="sgsst">🔒 SGSST</option>
              <option value="gerencia">📊 Gerencia</option>
            </select>
          </div>

          <div className="input-box">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Contraseña (mín. 8 caracteres)"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="input-box">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={form.confirmar}
              onChange={e => setForm({ ...form, confirmar: e.target.value })}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'CREAR CUENTA'}
          </button>

          <div style={{textAlign:'center',marginTop:'16px'}}>
            <Link to="/login" className="login-link">¿Ya tienes cuenta? Ingresa aquí</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
