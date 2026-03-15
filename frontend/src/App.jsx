import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login       from './components/Login';
import FormReporte from './components/FormReporte';
import PanelSST    from './components/PanelSST';
import Dashboard   from './components/Dashboard';
import Chatbot     from './components/Chatbot';

const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div>Cargando...</div>;
  if (!usuario) return <Navigate to="/login" />;
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/sin-acceso" />;
  }
  return (
    <>
      {children}
      <Chatbot />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

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
            <RutaProtegida rolesPermitidos={['gerencia', 'sgsst']}>
              <Dashboard />
            </RutaProtegida>
          } />

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/sin-acceso" element={<div>No tienes permisos para esta sección.</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
