// API service for communicating with ScaleX backend
import { auth } from '../modules/auth-social/services/firebaseAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get Firebase auth token
  async getAuthToken() {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Get Firebase auth token
    const token = await this.getAuthToken();

    // Get userId from localStorage (set by auth context) - for backward compatibility
    const userId = localStorage.getItem('userId');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Add Firebase token
        ...(userId && { 'x-user-id': userId }), // Add userId header if available (backward compatibility)
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Better error message for authentication issues
        if (response.status === 401) {
          throw new Error('No token provided');
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null;
      }

      // Check if response has content before parsing JSON
      const text = await response.text();
      if (!text || text.trim() === '') {
        return null;
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text);
        return null;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User management methods
  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async getUserByFirebaseUid(firebaseUid) {
    return this.request(`/users/firebase/${firebaseUid}`);
  }

  async getUserByEmail(email) {
    return this.request(`/users/email/${encodeURIComponent(email)}`);
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Address management methods
  async getUserAddresses(userId) {
    return this.request(`/users/${userId}/addresses`);
  }

  async createAddress(userId, addressData) {
    return this.request(`/users/${userId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(userId, addressId, addressData) {
    return this.request(`/users/${userId}/addresses/${addressId}`, {
      method: 'PATCH',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(userId, addressId) {
    return this.request(`/users/${userId}/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  // Helper method to check if user exists in backend
  async checkUserExists(firebaseUid) {
    try {
      const user = await this.getUserByFirebaseUid(firebaseUid);
      return user;
    } catch (error) {
      // If user doesn't exist, return null
      if (error.message.includes('404') || error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  // Helper method to create user from Firebase data
  async createUserFromFirebase(firebaseUser, userData) {
    const userPayload = {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      full_name: userData.full_name,
      birth_date: userData.birth_date,
      phone: userData.phone,
      preferred_language: userData.preferred_language,
    };

    return await this.createUser(userPayload);
  }

  // Admin user management methods
  async getAllUsers() {
    return this.request('/users');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
