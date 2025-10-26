import apiService from '../../../../services/api';

class CourseApiService {
  // ========================================
  // STAGES
  // ========================================

  async getAllStages() {
    const response = await apiService.request('/api/english-course/stages');
    return response;
  }

  async getStage(stageId) {
    const response = await apiService.request(`/api/english-course/stages/${stageId}`);
    return response;
  }

  async createStage(data) {
    const response = await apiService.request('/api/english-course/stages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateStage(stageId, data) {
    const response = await apiService.request(`/api/english-course/stages/${stageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteStage(stageId) {
    await apiService.request(`/api/english-course/stages/${stageId}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // UNITS
  // ========================================

  async getUnitsByStage(stageId) {
    const response = await apiService.request(`/api/english-course/stages/${stageId}/units`);
    return response;
  }

  async getUnit(unitId) {
    const response = await apiService.request(`/api/english-course/units/${unitId}`);
    return response;
  }

  async createUnit(data) {
    const response = await apiService.request('/api/english-course/units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateUnit(unitId, data) {
    const response = await apiService.request(`/api/english-course/units/${unitId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteUnit(unitId) {
    await apiService.request(`/api/english-course/units/${unitId}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // CARDS
  // ========================================

  async getCardsByUnit(unitId) {
    const response = await apiService.request(`/api/english-course/units/${unitId}/cards`);
    return response;
  }

  async getCard(cardId) {
    const response = await apiService.request(`/api/english-course/cards/${cardId}`);
    return response;
  }

  async createCard(data) {
    const response = await apiService.request('/api/english-course/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateCard(cardId, data) {
    const response = await apiService.request(`/api/english-course/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteCard(cardId) {
    await apiService.request(`/api/english-course/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // PROGRESS
  // ========================================

  async getDashboard() {
    const response = await apiService.request('/api/english-course/progress/dashboard');
    return response;
  }

  async getStageProgress(stageId) {
    const response = await apiService.request(`/api/english-course/progress/stages/${stageId}`);
    return response;
  }

  async startStage(stageId) {
    const response = await apiService.request(`/api/english-course/progress/stages/${stageId}/start`, {
      method: 'POST',
    });
    return response;
  }

  async getUnitProgress(unitId) {
    const response = await apiService.request(`/api/english-course/progress/units/${unitId}`);
    return response;
  }

  async startUnit(unitId) {
    const response = await apiService.request(`/api/english-course/progress/units/${unitId}/start`, {
      method: 'POST',
    });
    return response;
  }

  async updateWatchTime(unitId, watchTimeSeconds) {
    const response = await apiService.request(`/api/english-course/progress/units/${unitId}/watch-time`, {
      method: 'PATCH',
      body: JSON.stringify({ watchTimeSeconds }),
    });
    return response;
  }

  async completeUnit(unitId) {
    const response = await apiService.request(`/api/english-course/progress/units/${unitId}/complete`, {
      method: 'POST',
    });
    return response;
  }

  async skipUnit(unitId) {
    const response = await apiService.request(`/api/english-course/progress/units/${unitId}/skip`, {
      method: 'POST',
    });
    return response;
  }

  // ========================================
  // REVIEW
  // ========================================

  async getDueCards(limit = 20) {
    const response = await apiService.request(`/api/english-course/review/due?limit=${limit}`);
    return response;
  }

  async submitReview(cardId, result, timeTakenSeconds) {
    const response = await apiService.request('/api/english-course/review/submit', {
      method: 'POST',
      body: JSON.stringify({
        cardId,
        result,
        timeTakenSeconds,
      }),
    });
    return response;
  }

  async getReviewStats(period = 'today') {
    const response = await apiService.request(`/api/english-course/review/stats?period=${period}`);
    return response;
  }
}

const courseApiService = new CourseApiService();
export default courseApiService;
