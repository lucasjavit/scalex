import { getApiUrl } from '../../../utils/apiUrl';
import { auth } from '../../auth-social/services/firebaseAuth';

/**
 * Obter token Firebase do usuário autenticado
 */
const getAuthToken = async () => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }
  return await auth.currentUser.getIdToken();
};

class AdminApiService {
  // Users management
  async getAllUsers() {
    const token = await getAuthToken();

    const response = await fetch(getApiUrl('/users'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async toggleUserStatus(userId) {
    const token = await getAuthToken();

    const response = await fetch(getApiUrl(`/users/${userId}/toggle-status`), {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle user status');
    }

    return response.json();
  }

  async deleteUser(userId) {
    const token = await getAuthToken();

    const response = await fetch(getApiUrl(`/users/${userId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete user' }));
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  // English Learning module statistics
  async getEnglishLearningStages() {
    const token = await getAuthToken();

    const response = await fetch(getApiUrl('/english-course/stages'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stages');
    }

    const result = await response.json();
    // API may return array directly or wrapped in data property
    return Array.isArray(result) ? result : (result.data || []);
  }

  async getVideoCallSessions() {
    const token = await getAuthToken();

    const response = await fetch(getApiUrl('/english-learning/admin/video-call/sessions'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch video call sessions');
    }

    const result = await response.json();
    return result.data || [];
  }
}

export default new AdminApiService();
