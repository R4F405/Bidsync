import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="w-full px-4">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo - Left */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-3xl font-bold text-primary tracking-tight">
                            Bidsync
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                {/* Favorites */}
                                <button className="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors group">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                    </svg>
                                    <span className="text-xs mt-1">Favoritos</span>
                                </button>

                                {/* Messages (Buzón) */}
                                <button className="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors group">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                    <span className="text-xs mt-1">Mensajes</span>
                                </button>

                                {/* Profile (Avatar only, no text) */}
                                <div className="relative group cursor-pointer">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300 group-hover:border-gray-400 transition-colors">
                                        {/* Placeholder avatar or user image */}
                                        <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    {/* Dropdown for Logout (hidden by default, shown on hover/click - simplified for now) */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100">
                                        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                                            {user?.email}
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>

                                {/* Subastar Button */}
                                <Link
                                    to="/items/new"
                                    className="ml-4 bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Subastar
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 font-medium hover:text-primary transition-colors"
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

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button className="text-gray-500 hover:text-primary p-2">
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
