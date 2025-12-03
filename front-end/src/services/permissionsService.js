import { getApiUrl } from '../utils/apiUrl';

/**
 * Service for managing user permissions
 */
class PermissionsService {
  /**
   * Get current user's permissions
   * @param {string} token - Firebase ID token
   * @returns {Promise<Object>} User permissions object
   */
  async getMyPermissions(token) {
    try {
      const response = await fetch(getApiUrl('/user-permissions/me'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  /**
   * Get all users with their permissions (Admin only)
   * @param {string} token - Firebase ID token
   * @returns {Promise<Array>} Array of users with permissions
   */
  async getAllUsersWithPermissions(token) {
    try {
      const response = await fetch(getApiUrl('/user-permissions/all'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all users with permissions:', error);
      throw error;
    }
  }

  /**
   * Get permissions for a specific user (Admin only)
   * @param {string} userId - User ID
   * @param {string} token - Firebase ID token
   * @returns {Promise<Object>} User permissions object
   */
  async getUserPermissions(userId, token) {
    try {
      const response = await fetch(getApiUrl(`/user-permissions/${userId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  /**
   * Update permissions for a specific user (Admin only)
   * @param {string} userId - User ID
   * @param {Object} permissions - Permissions object to update
   * @param {string} token - Firebase ID token
   * @returns {Promise<Object>} Updated permissions object
   */
  async updateUserPermissions(userId, permissions, token) {
    try {
      const response = await fetch(getApiUrl(`/user-permissions/${userId}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissions),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }

  /**
   * Parse permissions object to a more convenient format
   * @param {Object} permissions - Raw permissions from API
   * @returns {Object} Parsed permissions with helper methods
   */
  parsePermissions(permissions) {
    return {
      learningCourse: permissions.learningCourse || false,
      learningConversation: permissions.learningConversation || false,
      businessAccounting: permissions.businessAccounting || false,
      businessCareer: permissions.businessCareer || false,
      businessJobs: permissions.businessJobs || false,
      businessInsurance: permissions.businessInsurance || false,
      businessBanking: permissions.businessBanking || false,

      // Helper method to check if user has a specific permission
      hasPermission: (module) => {
        const moduleMap = {
          'learning.course': permissions.learningCourse,
          'learning.conversation': permissions.learningConversation,
          'business.accounting': permissions.businessAccounting,
          'accounting.access': permissions.businessAccounting, // Alias for accounting access
          'business.career': permissions.businessCareer,
          'business.jobs': permissions.businessJobs,
          'business.insurance': permissions.businessInsurance,
          'business.banking': permissions.businessBanking,
        };
        return moduleMap[module] || false;
      },

      // Get all granted permissions
      getGrantedPermissions: () => {
        const granted = [];
        if (permissions.learningCourse) granted.push('learning.course');
        if (permissions.learningConversation) granted.push('learning.conversation');
        if (permissions.businessAccounting) granted.push('business.accounting');
        if (permissions.businessCareer) granted.push('business.career');
        if (permissions.businessJobs) granted.push('business.jobs');
        if (permissions.businessInsurance) granted.push('business.insurance');
        if (permissions.businessBanking) granted.push('business.banking');
        return granted;
      },
    };
  }
}

const permissionsService = new PermissionsService();
export default permissionsService;
