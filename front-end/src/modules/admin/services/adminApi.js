import apiService from '../../../services/api';

class AdminApiService {
  // Users management
  async getAllUsers() {
    return apiService.getAllUsers();
  }

  async toggleUserStatus(userId) {
    return apiService.request(`/users/${userId}/toggle-status`, {
      method: 'PATCH',
    });
  }
}

export default new AdminApiService();
