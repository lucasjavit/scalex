import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../modules/auth-social/context/AuthContext';
import permissionsService from '../services/permissionsService';

/**
 * Hook to manage user permissions
 *
 * @returns {Object} Object containing:
 *   - permissions: Object with permission flags
 *   - hasPermission: Function to check if user has a specific permission
 *   - loading: Boolean indicating if permissions are being loaded
 *   - error: Error object if loading failed
 *   - refetch: Function to manually refetch permissions
 */
export function useUserPermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();
      const data = await permissionsService.getMyPermissions(token);
      const parsedPermissions = permissionsService.parsePermissions(data);

      setPermissions(parsedPermissions);
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError(err);
      // Set default permissions on error (only conversation)
      setPermissions({
        learningCourse: false,
        learningConversation: true,
        businessAccounting: false,
        businessCareer: false,
        businessJobs: false,
        businessInsurance: false,
        businessBanking: false,
        hasPermission: (module) => module === 'learning.conversation',
        getGrantedPermissions: () => ['learning.conversation'],
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Check if user has a specific permission
   * @param {string} module - Module identifier (e.g., 'learning.conversation')
   * @returns {boolean} True if user has permission
   */
  const hasPermission = useCallback(
    (module) => {
      if (!permissions) return false;
      return permissions.hasPermission(module);
    },
    [permissions]
  );

  /**
   * Manually refetch permissions
   * Useful after permissions are updated
   */
  const refetch = useCallback(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    hasPermission,
    loading,
    error,
    refetch,
  };
}
