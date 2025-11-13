import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Este componente comprueba si el usuario está autenticado.
 * Si lo está, renderiza las rutas hijas (Outlet).
 * Si no, lo redirige a /login.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Esperamos a que el AuthContext termine de cargar
  if (isLoading) {
    return <div>Cargando autenticación...</div>;
  }

  // Si no está autenticado, fuera
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostramos el contenido
  return <Outlet />;
};