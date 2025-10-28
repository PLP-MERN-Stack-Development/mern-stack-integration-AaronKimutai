import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-gray-800 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div className="space-x-4">
                    <Link to="/" className="text-white hover:text-gray-300 transition duration-150">
                        Blog Home
                    </Link>
                    <Link to="/create" className="text-white hover:text-gray-300 transition duration-150">
                        Create Post
                    </Link>
                </div>

                <div className="space-x-4">
                    {user ? (
                        <>
                            <span className="text-gray-300">Hi, {user.username}</span>
                            <button
                                onClick={logout}
                                className="text-white hover:text-gray-300 transition duration-150"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-400 hover:text-white">Login</Link>
                            <Link to="/register" className="text-gray-400 hover:text-white">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
