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

  // Create a new video call session
  async createVideoCallSession(userId, preferences = {}) {
    try {
      const roomName = this.generateRoomName();
      const sessionData = {
        roomName,
        userId,
        preferences: {
          topic: preferences.topic || 'random',
          language: preferences.language || 'en',
          level: preferences.level || 'intermediate',
          duration: preferences.duration || 1, // minutes - default 1 minute for testing
          ...preferences
        },
        createdAt: new Date().toISOString(),
        startedAt: null,
        endedAt: null,
        status: 'waiting',
        duration: 0 // in seconds
      };

      // In a real implementation, this would save to backend
      // For now, we'll store in localStorage
      const sessions = this.getSessions();
      sessions[roomName] = sessionData;
      localStorage.setItem('videoCallSessions', JSON.stringify(sessions));

      return sessionData;
    } catch (error) {
      console.error('Error creating video call session:', error);
      throw error;
    }
  }

  // Get video call session by room name
  async getVideoCallSession(roomName) {
    try {
      const sessions = this.getSessions();
      return sessions[roomName] || null;
    } catch (error) {
      console.error('Error getting video call session:', error);
      throw error;
    }
  }

  // Update video call session
  async updateVideoCallSession(roomName, updates) {
    try {
      const sessions = this.getSessions();
      if (sessions[roomName]) {
        sessions[roomName] = { ...sessions[roomName], ...updates };
        localStorage.setItem('videoCallSessions', JSON.stringify(sessions));
        return sessions[roomName];
      }
      return null;
    } catch (error) {
      console.error('Error updating video call session:', error);
      throw error;
    }
  }

  // Start video call session (when call actually begins)
  async startVideoCallSession(roomName) {
    try {
      const sessions = this.getSessions();
      if (sessions[roomName]) {
        sessions[roomName].status = 'active';
        sessions[roomName].startedAt = new Date().toISOString();
        localStorage.setItem('videoCallSessions', JSON.stringify(sessions));
        return sessions[roomName];
      }
      return null;
    } catch (error) {
      console.error('Error starting video call session:', error);
      throw error;
    }
  }

  // End video call session
  async endVideoCallSession(roomName, duration = 0) {
    try {
      const sessions = this.getSessions();
      if (sessions[roomName]) {
        const now = new Date().toISOString();
        sessions[roomName].status = 'ended';
        sessions[roomName].endedAt = now;
        sessions[roomName].duration = duration;
        
        // Calculate duration if not provided
        if (duration === 0 && sessions[roomName].startedAt) {
          const start = new Date(sessions[roomName].startedAt);
          const end = new Date(now);
          sessions[roomName].duration = Math.round((end - start) / 1000); // in seconds
        }
        
        localStorage.setItem('videoCallSessions', JSON.stringify(sessions));
        return sessions[roomName];
      }
      return null;
    } catch (error) {
      console.error('Error ending video call session:', error);
      throw error;
    }
  }

  // Get all sessions for a user
  async getUserSessions(userId) {
    try {
      const sessions = this.getSessions();
      return Object.values(sessions).filter(session => session.userId === userId);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  }

  // Get sessions from localStorage
  getSessions() {
    try {
      const sessions = localStorage.getItem('videoCallSessions');
      return sessions ? JSON.parse(sessions) : {};
    } catch (error) {
      console.error('Error getting sessions from localStorage:', error);
      return {};
    }
  }

  // Find available partners for matching
  async findAvailablePartners(preferences = {}) {
    try {
      // In a real implementation, this would query the backend
      // For now, we'll simulate finding partners
      const mockPartners = [
        {
          id: 'user-1',
          name: 'Alex Johnson',
          level: 'intermediate',
          country: 'United States',
          interests: ['travel', 'music', 'technology'],
          isOnline: true,
          lastSeen: new Date().toISOString()
        },
        {
          id: 'user-2',
          name: 'Maria Garcia',
          level: 'advanced',
          country: 'Spain',
          interests: ['food', 'books', 'career'],
          isOnline: true,
          lastSeen: new Date().toISOString()
        },
        {
          id: 'user-3',
          name: 'David Chen',
          level: 'beginner',
          country: 'China',
          interests: ['sports', 'music', 'technology'],
          isOnline: true,
          lastSeen: new Date().toISOString()
        }
      ];

      // Filter partners based on preferences
      let filteredPartners = mockPartners.filter(partner => partner.isOnline);

      if (preferences.level) {
        filteredPartners = filteredPartners.filter(partner => 
          partner.level === preferences.level
        );
      }

      if (preferences.interests && preferences.interests.length > 0) {
        filteredPartners = filteredPartners.filter(partner =>
          partner.interests.some(interest => 
            preferences.interests.includes(interest)
          )
        );
      }

      return filteredPartners;
    } catch (error) {
      console.error('Error finding available partners:', error);
      throw error;
    }
  }

  // Match users for video call
  async matchUsers(userId, preferences = {}) {
    try {
      const availablePartners = await this.findAvailablePartners(preferences);
      
      if (availablePartners.length === 0) {
        return null;
      }

      // Randomly select a partner
      const randomIndex = Math.floor(Math.random() * availablePartners.length);
      const matchedPartner = availablePartners[randomIndex];

      // Create room for both users
      const roomName = this.generateRoomName();
      const sessionData = {
        roomName,
        userId,
        matchedUserId: matchedPartner.id,
        matchedUser: matchedPartner,
        preferences,
        createdAt: new Date().toISOString(),
        status: 'matched'
      };

      // Save session
      const sessions = this.getSessions();
      sessions[roomName] = sessionData;
      localStorage.setItem('videoCallSessions', JSON.stringify(sessions));

      return sessionData;
    } catch (error) {
      console.error('Error matching users:', error);
      throw error;
    }
  }

  // Get conversation topics
  getConversationTopics() {
    return [
      { id: 'random', name: 'Random Topics', icon: '🎲', description: 'Surprise me with any topic!' },
      { id: 'travel', name: 'Travel & Culture', icon: '✈️', description: 'Share travel experiences and cultural insights' },
      { id: 'food', name: 'Food & Cooking', icon: '🍕', description: 'Discuss favorite foods and cooking tips' },
      { id: 'technology', name: 'Technology', icon: '💻', description: 'Talk about the latest tech trends and innovations' },
      { id: 'sports', name: 'Sports & Fitness', icon: '⚽', description: 'Share sports experiences and fitness goals' },
      { id: 'music', name: 'Music & Entertainment', icon: '🎵', description: 'Discuss favorite music and entertainment' },
      { id: 'books', name: 'Books & Literature', icon: '📚', description: 'Share book recommendations and literary discussions' },
      { id: 'career', name: 'Career & Work', icon: '💼', description: 'Talk about professional experiences and goals' }
    ];
  }

  // Get random conversation starters
  getRandomConversationStarters() {
    return [
      "What's your favorite childhood memory?",
      "If you could travel anywhere, where would you go?",
      "What's the best book you've read recently?",
      "Describe your ideal weekend.",
      "What's something you're passionate about?",
      "If you could have dinner with anyone, who would it be?",
      "What's the most interesting place you've visited?",
      "What's a skill you'd like to learn?",
      "Describe your dream job.",
      "What's your favorite way to relax?",
      "If you could live in any time period, when would it be?",
      "What's the best advice you've ever received?",
      "What's something that always makes you smile?",
      "If you could have any superpower, what would it be?",
      "What's your favorite type of music?",
      "Describe your perfect day.",
      "What's something you're grateful for?",
      "If you could learn any language, which would it be?",
      "What's your favorite season and why?",
      "What's a goal you're working towards?"
    ];
  }

  // Get a random conversation starter
  getRandomConversationStarter() {
    const starters = this.getRandomConversationStarters();
    return starters[Math.floor(Math.random() * starters.length)];
  }

  // Validate room name - accepts any non-empty room name or URL
  isValidRoomName(roomName) {
    if (!roomName || typeof roomName !== 'string') {
      return false;
    }

    // Extract room name from URL if provided
    const extracted = this.extractRoomNameFromUrl(roomName);
    if (extracted) {
      roomName = extracted;
    }

    // Remove whitespace
    roomName = roomName.trim();

    // Accept any non-empty alphanumeric string with hyphens, underscores, or dots
    // Must be at least 3 characters long
    return roomName.length >= 3 && /^[a-zA-Z0-9-_.]+$/.test(roomName);
  }

  // Extract room name from URL
  extractRoomNameFromUrl(input) {
    if (!input || typeof input !== 'string') {
      return null;
    }

    try {
      // Try to parse as URL
      const url = new URL(input);
      // Extract the last part of the pathname as room name
      const parts = url.pathname.split('/').filter(p => p.length > 0);
      return parts[parts.length - 1] || null;
    } catch (e) {
      // Not a URL, check if it's a relative path like /room/scale-123
      const match = input.match(/\/room\/([a-zA-Z0-9-_.]+)/);
      if (match) {
        return match[1];
      }
      // Return the input as-is if it's not a URL
      return input;
    }
  }

  // Get call statistics
  async getCallStatistics(userId) {
    try {
      const sessions = await this.getUserSessions(userId);
      const completedSessions = sessions.filter(session => session.status === 'ended');
      
      const totalCalls = completedSessions.length;
      
      // Calculate total duration using stored duration or calculated from timestamps
      const totalDuration = completedSessions.reduce((total, session) => {
        if (session.duration && session.duration > 0) {
          return total + session.duration; // use stored duration
        } else if (session.startedAt && session.endedAt) {
          const start = new Date(session.startedAt);
          const end = new Date(session.endedAt);
          return total + (end - start) / 1000; // calculate from timestamps
        }
        return total;
      }, 0);

      const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

      // Format duration for display
      const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
          return `${minutes}m ${secs}s`;
        } else {
          return `${secs}s`;
        }
      };

      return {
        totalCalls,
        totalDuration: Math.round(totalDuration),
        totalDurationFormatted: formatDuration(Math.round(totalDuration)),
        averageDuration: Math.round(averageDuration),
        averageDurationFormatted: formatDuration(Math.round(averageDuration)),
        lastCall: completedSessions.length > 0 ? 
          completedSessions[completedSessions.length - 1].endedAt : null,
        // Additional stats
        thisWeekCalls: this.getThisWeekCalls(completedSessions),
        thisMonthCalls: this.getThisMonthCalls(completedSessions)
      };
    } catch (error) {
      console.error('Error getting call statistics:', error);
      throw error;
    }
  }

  // Get calls from this week
  getThisWeekCalls(sessions) {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.endedAt);
      return sessionDate >= startOfWeek;
    }).length;
  }

  // Get calls from this month
  getThisMonthCalls(sessions) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.endedAt);
      return sessionDate >= startOfMonth;
    }).length;
  }
}

export default new VideoCallService();
