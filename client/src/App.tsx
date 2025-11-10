import { Outlet, Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <>
      {/* Barra de Navegación Simple */}
      <nav style={{ padding: '1rem', background: '#333' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>
          Bidsync
        </Link>
        <Link to="/login" style={{ marginRight: '1rem' }}>
          Login
        </Link>
      </nav>

      {/* Contenido Principal */}
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </>
  );
}

export default App;