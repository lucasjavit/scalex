import apiService from '../../../services/api';

class AdminApiService {
  // Lessons CRUD
  async getAllLessons() {
    return apiService.request('/english-course/admin/lessons');
  }

  async getLessonById(lessonId) {
    return apiService.request(`/english-course/admin/lessons/${lessonId}`);
  }

  async createLesson(lessonData) {
    return apiService.request('/english-course/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(lessonId, lessonData) {
    return apiService.request(`/english-course/admin/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(lessonId) {
    return apiService.request(`/english-course/admin/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  }

  // Questions CRUD
  async getQuestionsByLesson(lessonId) {
    return apiService.request(`/english-course/admin/lessons/${lessonId}/questions`);
  }

  async getQuestionById(questionId) {
    return apiService.request(`/english-course/admin/questions/${questionId}`);
  }

  async createQuestion(questionData) {
    return apiService.request('/english-course/admin/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(questionId, questionData) {
    return apiService.request(`/english-course/admin/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(questionId) {
    return apiService.request(`/english-course/admin/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  // Bulk operations
  async createQuestionsBulk(questionsData) {
    return apiService.request('/english-course/admin/questions/bulk', {
      method: 'POST',
      body: JSON.stringify(questionsData),
    });
  }

  async deleteQuestionsBulk(questionIds) {
    return apiService.request('/english-course/admin/questions/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ questionIds }),
    });
  }

  // Statistics
  async getAdminStatistics() {
    return apiService.request('/english-course/admin/statistics');
  }
}

export default new AdminApiService();
