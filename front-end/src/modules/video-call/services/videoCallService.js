// Video Call Service
// Handles video call related operations

class VideoCallService {
  constructor() {
    this.baseURL = import.meta?.env?.VITE_API_URL ?? 'http://localhost:3000';
  }

  // Generate a unique room name
  generateRoomName() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `scalex-${timestamp}-${random}`;
  }

  // Create a new video call session using API
  async createVideoCallSession(userId, preferences = {}) {
    try {
      const response = await fetch(`${this.baseURL}/video-call/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        userId,
          topic: preferences.topic || 'random',
          language: preferences.language || 'en',
          level: preferences.level || 'intermediate',
          duration: preferences.duration || 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating video call session via API:', error);
      throw error;
    }
  }

  // Validate room name - accepts any non-empty room name or URL
  isValidRoomName(roomName) {
    if (!roomName || typeof roomName !== 'string') {
      return false;
    }

    const extracted = this.extractRoomNameFromUrl(roomName);
    if (extracted) {
      roomName = extracted;
    }

    roomName = roomName.trim();
    return roomName.length >= 3 && /^[a-zA-Z0-9-_.]+$/.test(roomName);
  }

  // Extract room name from URL
  extractRoomNameFromUrl(input) {
    if (!input || typeof input !== 'string') {
      return null;
    }

    try {
      const url = new URL(input);
      const parts = url.pathname.split('/').filter(p => p.length > 0);
      return parts[parts.length - 1] || null;
    } catch (e) {
      const match = input.match(/\/room\/([a-zA-Z0-9-_.]+)/);
      if (match) {
        return match[1];
      }
      return input;
    }
  }

  // Simple mock statistics for now
  async getCallStatistics(userId) {
    return {
      totalCalls: 0,
      totalDuration: 0,
      totalDurationFormatted: '0m',
      averageDuration: 0,
      averageDurationFormatted: '0m',
      lastCall: null,
      thisWeekCalls: 0,
      thisMonthCalls: 0
    };
  }

  // ====== QUEUE METHODS ======

  /**
   * Join the waiting queue
   */
  async joinQueue(userId, level, preferences = {}) {
    try {
      console.log('=== JOINING QUEUE VIA API ===');
      console.log('User ID:', userId);
      console.log('Level:', level);
      console.log('Preferences:', preferences);

      const response = await fetch(`${this.baseURL}/video-call/queue/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          level,
          topic: preferences.topic,
          language: preferences.language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Queue join result:', result);
      console.log('=== END JOINING QUEUE ===');
      
      return result;
    } catch (error) {
      console.error('Error joining queue:', error);
      throw error;
    }
  }

  /**
   * Leave the waiting queue
   */
  async leaveQueue(userId) {
    try {
      console.log('=== LEAVING QUEUE VIA API ===');
      console.log('User ID:', userId);

      const response = await fetch(`${this.baseURL}/video-call/queue/leave/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Queue leave result:', result);
      console.log('=== END LEAVING QUEUE ===');
      
      return result;
    } catch (error) {
      console.error('Error leaving queue:', error);
      throw error;
    }
  }

  /**
   * Get queue status for a user
   */
  async getQueueStatus(userId) {
    try {
      const response = await fetch(`${this.baseURL}/video-call/queue/status/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting queue status:', error);
      throw error;
    }
  }

  /**
   * Get all users in queue (for admin/debugging)
   */
  async getQueue() {
    try {
      const response = await fetch(`${this.baseURL}/video-call/queue`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting queue:', error);
      throw error;
    }
  }

  /**
   * Get all sessions (for admin/debugging)
   */
  async getAllSessions() {
    try {
      const response = await fetch(`${this.baseURL}/video-call/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }

  /**
   * Get session room details
   */
  async getSessionRoom(roomName) {
    try {
      const response = await fetch(`${this.baseURL}/video-call/session-room/${roomName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting session room:', error);
      throw error;
    }
  }
}

export default new VideoCallService();
