import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import App from '../App';

// Usamos el nuevo sistema de enrutamiento basado en objetos
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App.tsx será el layout raíz
    children: [
      // Rutas que se renderizarán dentro del <Outlet /> de App.tsx
      {
        index: true, // Ruta hija por defecto (path: '/')
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};