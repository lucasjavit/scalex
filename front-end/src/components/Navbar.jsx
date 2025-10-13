import { signOut } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth-social/context/AuthContext';
import { auth } from '../modules/auth-social/services/firebaseAuth';

// Add CSS animation for gradient shift and glow effect
const gradientAnimation = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes glow {
    0%, 100% { 
      filter: brightness(1) drop-shadow(0 0 6px rgba(102, 126, 234, 0.3));
    }
    50% { 
      filter: brightness(1.1) drop-shadow(0 0 10px rgba(118, 75, 162, 0.5)) drop-shadow(0 0 15px rgba(240, 147, 251, 0.3));
    }
  }
  
  .shining-text {
    position: relative;
    overflow: hidden;
  }
  
  .shining-text::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    animation: shine 4s infinite;
  }
  
  @keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = gradientAnimation;
  document.head.appendChild(style);
}

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
              className="shining-text font-semibold text-lg cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 3s ease infinite, glow 2s ease-in-out infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              ScaleX
            </span>

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