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
            <span>Hola, {user?.email}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
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