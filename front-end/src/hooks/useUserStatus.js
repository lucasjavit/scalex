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
        setUserStatus(userData);
      } catch (err) {
        console.error('Error checking user status:', err);
        setError('Erro ao verificar status do usuário');
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
    isInactive: userStatus?.is_active === false
  };
};
