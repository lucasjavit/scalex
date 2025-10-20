import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useAuth } from '../modules/auth-social/context/AuthContext';
import { auth } from '../modules/auth-social/services/firebaseAuth';
import LanguageSelector from './LanguageSelector';

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
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const [shouldGlow, setShouldGlow] = useState(false);
  const [hasGlowed, setHasGlowed] = useState(false);

  // Control glow effect - glow for 30 seconds after login, then stop permanently
  useEffect(() => {
    if (user && !hasGlowed) {
      // console.log('🔥 Starting glow effect for ScaleX');
      // Start glowing when user logs in
      setShouldGlow(true);
      setHasGlowed(true);
      
      // Stop glowing after 30 seconds (30000ms)
      const timer = setTimeout(() => {
        // console.log('⏰ Stopping glow effect after 30 seconds');
        setShouldGlow(false);
      }, 30000);
      
      // Cleanup timer on unmount
      return () => clearTimeout(timer);
    } else if (!user) {
      // console.log('🔄 Resetting glow state on logout');
      // Reset when user logs out
      setShouldGlow(false);
      setHasGlowed(false);
    }
  }, [user, hasGlowed]);

  // Theme toggle state (persisted)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'night';
    return localStorage.getItem('theme') || 'night';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (theme === 'day') body.classList.add('theme-day'); else body.classList.remove('theme-day');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'day' ? 'night' : 'day'));

  // Don't render navbar if user is not logged in or on landing/login pages
  if (!user || location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // console.log('Logout successful');
      })
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

          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            {/* Admin Panel Button - Only visible for admins */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className={`text-sm font-medium transition-colors duration-200 flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                }`}
                title={t('navigation.adminPanel')}
              >
                <span>🔧</span>
                <span>{t('navigation.adminPanel')}</span>
              </button>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* User Avatar - Clickable (moved to left of logout) */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                onClick={handleProfileClick}
                className="w-9 h-9 rounded-full border-2 border-copilot-border-default hover:border-copilot-border-focus transition-colors duration-150 cursor-pointer"
                title="Click to view profile"
              />
            ) : (
              <div
                onClick={handleProfileClick}
                className="w-9 h-9 rounded-full bg-copilot-gradient flex items-center justify-center border-2 border-copilot-border-default hover:border-copilot-border-focus transition-colors duration-150 cursor-pointer"
                title="Click to view profile"
              >
                <span className="text-white text-sm font-bold">
                  {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn-copilot-secondary text-sm"
              title={t('tooltips.logout')}
              aria-label={t('tooltips.logout')}
            >
              {t('navigation.logout')}
            </button>

            {/* Theme Toggle (emoji only) */}
            <button
              onClick={toggleTheme}
              className="btn-copilot-secondary text-sm w-9 h-9 flex items-center justify-center"
              title={theme === 'day' ? t('tooltips.switchToNight') : t('tooltips.switchToDay')}
              aria-label={theme === 'day' ? t('tooltips.switchToNight') : t('tooltips.switchToDay')}
            >
              {theme === 'day' ? '🌙' : '🌤️'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}