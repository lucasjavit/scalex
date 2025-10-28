import { useEffect, useState } from 'react';
import { useAuth } from '../modules/auth-social/context/AuthContext';
import apiService from '../services/api';

export const useUserStatus = () => {
  const { user } = useAuth();
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setUserStatus(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get user data from backend to check is_active status
        const userData = await apiService.getUserByFirebaseUid(user.uid);

        // If user doesn't exist in backend, treat as new user (null status)
        if (!userData) {
          console.log('User not found in database - new user needs to complete registration');
          setUserStatus(null);
          localStorage.removeItem('userId'); // Remove userId if user doesn't exist
        } else {
          setUserStatus(userData);
          // Store userId in localStorage for API requests
          if (userData.id) {
            localStorage.setItem('userId', userData.id);
          }
        }
      } catch (err) {
        console.error('Error checking user status:', err);
        setError('Error checking user status');
        setUserStatus(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [user]);

  return {
    userStatus,
    loading,
    error,
    isActive: userStatus?.is_active === true,
    isInactive: userStatus?.is_active === false,
    isNewUser: user && !userStatus && !loading && !error // Firebase authenticated but not in DB
  };
};
