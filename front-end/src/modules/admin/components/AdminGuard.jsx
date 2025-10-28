import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../../components/BackButton';
import { useUserStatus } from '../../../hooks/useUserStatus';
import { useAuth } from '../../auth-social/context/AuthContext';

const AdminGuard = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { userStatus, isActive, isInactive, loading: userStatusLoading, error: userStatusError } = useUserStatus();

  useEffect(() => {
    checkAdminAccess();
  }, [user, userStatus, isActive, isInactive, userStatusLoading]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    // Wait for user status to load
    if (userStatusLoading) {
      return;
    }

    // Check if user is active
    if (isInactive) {
      navigate('/home');
      return;
    }

    // Check if user data is available
    if (!userStatus) {
      navigate('/home');
      return;
    }

    // Allow access to admin and partner_english_course roles
    const allowedRoles = ['admin', 'partner_english_course'];
    const hasAdminAccess = allowedRoles.includes(userStatus.role);

    if (!hasAdminAccess) {
      navigate('/home');
      return;
    }

    setHasAccess(true);
    setIsLoading(false);
  };

  if (isLoading || userStatusLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (userStatusError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-2">
            Verification Error
          </h2>
          <p className="text-copilot-text-secondary mb-6">
            Could not verify your permissions. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-copilot-accent-primary text-white px-6 py-3 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-2">
            Access Denied
          </h2>
          <p className="text-copilot-text-secondary mb-6">
            You don't have permission to access this administrative area.
          </p>
          <div className="flex justify-center">
            <BackButton to="/home" label="Back to Home" />
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminGuard;

