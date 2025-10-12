import { useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useAuth } from '../modules/auth-social/context/AuthContext';
import { auth } from '../modules/auth-social/services/firebaseAuth';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  // Don't render navbar if user is not logged in or on login page
  if (!user || location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => console.log('Logout successful'))
      .catch((error) => console.error('Logout error:', error));
  };

  return (
    <nav className="bg-copilot-bg-secondary border-b border-copilot-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <span className="bg-copilot-gradient bg-clip-text text-transparent font-semibold text-lg">
              ScaleX
            </span>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-9 h-9 rounded-full border-2 border-copilot-border-default hover:border-copilot-border-focus transition-colors duration-150"
              />
            )}

            {/* User Name */}
            <span className="text-copilot-text-primary text-sm font-medium">
              {user.displayName || user.email}
            </span>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn-copilot-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}