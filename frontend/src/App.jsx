import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login        from './components/Login';
import Registro     from './components/Registro';
import FormReporte  from './components/FormReporte';
import PanelSST     from './components/PanelSST';
import Dashboard    from './components/Dashboard';
import MapaCalor    from './components/MapaCalor';
import Notificaciones from './components/Notificaciones';
import MiPerfil     from './components/MiPerfil';
import Chatbot      from './components/Chatbot';
import Navbar       from './components/Navbar';

const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { usuario, cargando } = useAuth();
  if (cargando) return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#050916,#0a1128)',
      color:'var(--cream)', fontFamily:'var(--font-d)', fontSize:'16px', gap:'12px'
    }}>
      <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:'2px solid var(--gold)', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
      Cargando...
    </div>
  );
  if (!usuario) return <Navigate to="/login" />;
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) return <Navigate to="/sin-acceso" />;
  return (
  <>
    <Navbar />
    {children}
    <Chatbot />
  </>
);
};

const RUTA_INICIO_POR_ROL = { funcionario: '/reportar', sgsst: '/panel-sst', gerencia: '/dashboard' };

const SinAcceso = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const rutaInicio = RUTA_INICIO_POR_ROL[usuario?.rol] || '/login';

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:'20px', color:'var(--cream)', background:'linear-gradient(135deg,#050916,#0a1128)',
      fontFamily:'var(--font-d)', fontSize:'18px', textAlign:'center', padding:'24px'
    }}>
      <div>No tienes permisos para esta sección.</div>
      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center' }}>
        <button
          onClick={() => navigate(rutaInicio)}
          style={{ padding:'10px 22px', borderRadius:'10px', border:'1px solid var(--rim-accent)', background:'var(--gold-dim)', color:'var(--gold)', fontFamily:'var(--font-b)', fontSize:'14px', cursor:'pointer' }}
        >
          Volver a mi inicio
        </button>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{ padding:'10px 22px', borderRadius:'10px', border:'1px solid rgba(224,92,58,0.2)', background:'var(--ember-dim)', color:'var(--ember)', fontFamily:'var(--font-b)', fontSize:'14px', cursor:'pointer' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route path="/reportar" element={
            <RutaProtegida rolesPermitidos={['funcionario']}>
              <FormReporte />
            </RutaProtegida>
          } />

          <Route path="/panel-sst" element={
            <RutaProtegida rolesPermitidos={['sgsst']}>
              <PanelSST />
            </RutaProtegida>
          } />

          <Route path="/dashboard" element={
            <RutaProtegida rolesPermitidos={['gerencia','sgsst']}>
              <Dashboard />
            </RutaProtegida>
          } />

          <Route path="/mapa" element={
            <RutaProtegida rolesPermitidos={['gerencia','sgsst']}>
              <MapaCalor />
            </RutaProtegida>
          } />

          <Route path="/notificaciones" element={
            <RutaProtegida rolesPermitidos={['funcionario','sgsst','gerencia']}>
              <Notificaciones />
            </RutaProtegida>
          } />

          <Route path="/perfil" element={
            <RutaProtegida rolesPermitidos={['funcionario','sgsst','gerencia']}>
              <MiPerfil />
            </RutaProtegida>
          } />

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/sin-acceso" element={<SinAcceso />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
