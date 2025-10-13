// API service for communicating with ScaleX backend
const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null;
      }

      return await response.json();
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
    return this.request(`/users/email?email=${encodeURIComponent(email)}`);
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

  // ============================================
  // ENGLISH COURSE METHODS
  // ============================================

  // Lesson methods
  async getEnglishLessons(level) {
    const query = level ? `?level=${level}` : '';
    return this.request(`/english-course/lessons${query}`);
  }

  async getEnglishLesson(lessonId) {
    return this.request(`/english-course/lessons/${lessonId}`);
  }

  async createLesson(lessonData) {
    return this.request('/english-course/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(lessonId, lessonData) {
    return this.request(`/english-course/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(lessonId) {
    return this.request(`/english-course/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  }

  // Question methods
  async getQuestionsByLesson(lessonId) {
    return this.request(`/english-course/lessons/${lessonId}/questions`);
  }

  async getQuestion(questionId) {
    return this.request(`/english-course/questions/${questionId}`);
  }

  async createQuestion(questionData) {
    return this.request('/english-course/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(questionId, questionData) {
    return this.request(`/english-course/questions/${questionId}`, {
      method: 'PATCH',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(questionId) {
    return this.request(`/english-course/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  // Progress methods
  async getUserProgress(userId) {
    return this.request(`/english-course/users/${userId}/progress`);
  }

  async getLessonProgress(userId, lessonId) {
    return this.request(`/english-course/users/${userId}/lessons/${lessonId}/progress`);
  }

  async updateProgress(userId, lessonId, progressData) {
    return this.request(`/english-course/users/${userId}/lessons/${lessonId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(progressData),
    });
  }

  // Answer submission
  async submitAnswer(userId, lessonId, answerData) {
    return this.request(`/english-course/users/${userId}/lessons/${lessonId}/submit-answer`, {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  }

  // Difficulty submission for Anki-style spaced repetition
  async submitDifficulty(userId, lessonId, questionId, difficulty) {
    return this.request(`/english-course/users/${userId}/lessons/${lessonId}/questions/${questionId}/difficulty`, {
      method: 'POST',
      body: JSON.stringify({ difficulty }),
    });
  }


  // Review methods
  async getDueReviews(userId, limit = 20) {
    return this.request(`/english-course/users/${userId}/reviews/due?limit=${limit}`);
  }

  async getDueReviewsForLesson(userId, lessonId, limit = 20) {
    return this.request(`/english-course/users/${userId}/lessons/${lessonId}/reviews/due?limit=${limit}`);
  }

  async getAllReviews(userId) {
    return this.request(`/english-course/users/${userId}/reviews/all`);
  }


  // SRS methods for lesson-specific practice
  async getDueQuestionsByLesson(userId, lessonId, limit = 20) {
    return this.request(`/english-course/lessons/${lessonId}/questions/due?userId=${userId}&limit=${limit}`);
  }

  async getNewQuestionsByLesson(userId, lessonId, limit = 10) {
    return this.request(`/english-course/lessons/${lessonId}/questions/new?userId=${userId}&limit=${limit}`);
  }

  async markReviewsAsDue() {
    return this.request('/english-course/reviews/mark-due', {
      method: 'POST',
    });
  }

  // Statistics methods
  async getUserStatistics(userId) {
    return this.request(`/english-course/users/${userId}/statistics`);
  }

  async getAnswerHistory(userId, limit = 50) {
    return this.request(`/english-course/users/${userId}/answer-history?limit=${limit}`);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
