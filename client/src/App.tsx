import { Outlet, Link } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <nav style={{ padding: '1rem', background: '#333', display: 'flex', gap: '1rem' }}>
        <Link to="/">Bidsync</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/items/new" style={{ marginLeft: 'auto', color: '#87CEEB' }}>
              + Vender Artículo
            </Link>
            
            <span style={{ marginLeft: 'auto' }}>Hola, {user?.email}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginLeft: 'auto' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </>
  );
}

export default App;