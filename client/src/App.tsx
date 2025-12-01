import { Outlet } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-secondary">
      <Navbar />
      <main className="w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default App;