import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
                            Bidsync
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/items/new"
                                    className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-opacity-90 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                                >
                                    + Subir producto
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="text-gray-600 hover:text-primary font-medium transition-colors"
                                >
                                    Mis cosas
                                </Link>
                                <div className="flex items-center space-x-4 ml-4 border-l pl-4 border-gray-200">
                                    <span className="text-sm text-gray-500">Hola, {user?.email?.split('@')[0]}</span>
                                    <button
                                        onClick={logout}
                                        className="text-gray-400 hover:text-red-500 font-medium text-sm transition-colors"
                                    >
                                        Salir
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-primary font-medium hover:text-opacity-80"
                                >
                                    Inicia sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="border-2 border-primary text-primary px-5 py-1.5 rounded-full font-medium hover:bg-primary hover:text-white transition-all"
                                >
                                    Regístrate
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button (placeholder for now) */}
                    <div className="md:hidden flex items-center">
                        <button className="text-gray-500 hover:text-primary">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
