import { signOut } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth-social/context/AuthContext';
import { auth } from '../modules/auth-social/services/firebaseAuth';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't render navbar if user is not logged in or on login page
  if (!user || location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => console.log('Logout successful'))
      .catch((error) => console.error('Logout error:', error));
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <nav className="bg-copilot-bg-secondary border-b border-copilot-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-6">
            <span
              onClick={() => navigate('/home')}
              className="bg-copilot-gradient bg-clip-text text-transparent font-semibold text-lg cursor-pointer"
            >
              ScaleX
            </span>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => navigate('/home')}
                className={`text-sm px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/home'
                    ? 'text-copilot-accent-primary bg-copilot-bg-tertiary'
                    : 'text-copilot-text-secondary hover:text-copilot-text-primary hover:bg-copilot-bg-tertiary'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/english-course')}
                className={`text-sm px-3 py-2 rounded-md transition-colors ${
                  location.pathname.startsWith('/english-course')
                    ? 'text-copilot-accent-primary bg-copilot-bg-tertiary'
                    : 'text-copilot-text-secondary hover:text-copilot-text-primary hover:bg-copilot-bg-tertiary'
                }`}
              >
                English Course
              </button>
            </div>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            {/* User Avatar - Clickable */}
            <div className="flex items-center space-x-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  onClick={handleProfileClick}
                  className="w-9 h-9 rounded-full border-2 border-copilot-border-default hover:border-copilot-border-focus transition-colors duration-150 cursor-pointer"
                  title="Clique para ver perfil"
                />
              ) : (
                <div
                  onClick={handleProfileClick}
                  className="w-9 h-9 rounded-full bg-copilot-gradient flex items-center justify-center border-2 border-copilot-border-default hover:border-copilot-border-focus transition-colors duration-150 cursor-pointer"
                  title="Clique para ver perfil"
                >
                  <span className="text-white text-sm font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* User Name - Clickable */}
              <span 
                onClick={handleProfileClick}
                className="text-copilot-text-primary text-sm font-medium cursor-pointer hover:text-copilot-accent-primary transition-colors duration-150"
                title="Clique para ver perfil"
              >
                {user.displayName || user.email}
              </span>
            </div>

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