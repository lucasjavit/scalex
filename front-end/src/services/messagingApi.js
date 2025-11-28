// Global Messaging API Service
import { auth } from '../modules/auth-social/services/firebaseAuth';
import { getApiUrl } from '../utils/apiUrl';

class MessagingApiService {
  async getAuthToken() {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const token = await this.getAuthToken();
    const userId = localStorage.getItem('userId');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(userId && { 'x-user-id': userId }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      if (response.status === 204) return null;
      const text = await response.text();
      if (!text || text.trim() === '') return null;
      return JSON.parse(text);
    } catch (error) {
      console.error('Messaging API error:', error);
      throw error;
    }
  }

  // Send message
  async sendMessage(receiverId, moduleType, content, attachment = null) {
    return this.request('/messaging/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, moduleType, content, attachment }),
    });
  }

  // Get conversations for partner
  async getConversationsForPartner(moduleType) {
    return this.request(`/messaging/conversations/partner?moduleType=${moduleType}`);
  }

  // Get conversation for user
  async getConversationForUser(moduleType) {
    return this.request(`/messaging/conversations/user?moduleType=${moduleType}`);
  }

  // Get messages
  async getMessages(conversationId) {
    return this.request(`/messaging/conversations/${conversationId}/messages`);
  }

  // Mark as read
  async markAsRead(messageId) {
    return this.request(`/messaging/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  }

  // Get unread count
  async getUnreadCount(moduleType) {
    return this.request(`/messaging/unread-count?moduleType=${moduleType}`);
  }
}

export const messagingApi = new MessagingApiService();
export default messagingApi;
