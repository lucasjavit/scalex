import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
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
      filter: brightness(1) drop-shadow(0 0 3px rgba(102, 126, 234, 0.2));
    }
    50% { 
      filter: brightness(1.05) drop-shadow(0 0 6px rgba(118, 75, 162, 0.3)) drop-shadow(0 0 8px rgba(240, 147, 251, 0.2));
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
  const { isAdmin } = useIsAdmin();
  const [shouldGlow, setShouldGlow] = useState(false);
  const [hasGlowed, setHasGlowed] = useState(false);

  // Control glow effect - glow for 30 seconds after login, then stop permanently
  useEffect(() => {
    if (user && !hasGlowed) {
      console.log('🔥 Starting glow effect for ScaleX');
      // Start glowing when user logs in
      setShouldGlow(true);
      setHasGlowed(true);
      
      // Stop glowing after 30 seconds (30000ms)
      const timer = setTimeout(() => {
        console.log('⏰ Stopping glow effect after 30 seconds');
        setShouldGlow(false);
      }, 30000);
      
      // Cleanup timer on unmount
      return () => clearTimeout(timer);
    } else if (!user) {
      console.log('🔄 Resetting glow state on logout');
      // Reset when user logs out
      setShouldGlow(false);
      setHasGlowed(false);
    }
  }, [user, hasGlowed]);

  // Don't render navbar if user is not logged in or on landing/login pages
  if (!user || location.pathname === '/' || location.pathname === '/login') {
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
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${shouldGlow ? 'shining-text' : ''}`}
              style={shouldGlow ? {
                background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 3s ease infinite, glow 2s ease-in-out infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              } : {
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold',
                fontSize: '1.125rem', // text-lg equivalent
              }}
            >
              ScaleX
            </span>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate('/english-course')}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname.startsWith('/english-course')
                    ? 'text-copilot-accent-primary'
                    : 'text-copilot-text-secondary hover:text-copilot-text-primary'
                }`}
              >
                English Course
              </button>
              <button
                onClick={() => navigate('/video-call')}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname.startsWith('/video-call')
                    ? 'text-copilot-accent-primary'
                    : 'text-copilot-text-secondary hover:text-copilot-text-primary'
                }`}
              >
                Video Call
              </button>
              
              {/* Admin Button - Only visible for admins */}
              {isAdmin && (
                <button
                  onClick={() => navigate('/video-call/admin')}
                  className={`text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                    location.pathname === '/video-call/admin'
                      ? 'text-copilot-accent-primary'
                      : 'text-yellow-600 hover:text-yellow-700'
                  }`}
                  title="Painel de Administração"
                >
                  <span>🔧</span>
                  <span>Admin</span>
                </button>
              )}
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