import { auth } from '../../auth-social/services/firebaseAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

    const response = await fetch(`${API_URL}/users`, {
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

    const response = await fetch(`${API_URL}/users/${userId}/toggle-status`, {
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

    const response = await fetch(`${API_URL}/users/${userId}`, {
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
}

export default new AdminApiService();
