// Remote Jobs Admin Service
import { auth } from '../modules/auth-social/services/firebaseAuth';
import { getApiUrl } from '../utils/apiUrl';

class RemoteJobsAdminService {
  // Get Firebase auth token
  async getAuthToken() {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const token = await this.getAuthToken();
    const userId = localStorage.getItem('userId');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(userId && { 'x-user-id': userId }),
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

      if (response.status === 204) {
        return null;
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        return null;
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Remote Jobs Admin API request failed:', error);
      throw error;
    }
  }

  /**
   * Dashboard
   */
  async getDashboard() {
    return this.request('/admin/remote-jobs/dashboard');
  }

  /**
   * Companies Management
   */
  async getAllCompanies(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.featured !== undefined) params.append('featured', filters.featured);

    const queryString = params.toString();
    return this.request(`/admin/remote-jobs/companies${queryString ? `?${queryString}` : ''}`);
  }

  async getCompanyById(id) {
    return this.request(`/admin/remote-jobs/companies/${id}`);
  }

  async createCompany(data) {
    return this.request('/admin/remote-jobs/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompany(id, data) {
    return this.request(`/admin/remote-jobs/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id) {
    return this.request(`/admin/remote-jobs/companies/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Job Boards
   */
  async getAllJobBoards() {
    return this.request('/admin/remote-jobs/job-boards');
  }

  /**
   * Job Board Companies Management
   */
  async getJobBoardCompanies(filters = {}) {
    const params = new URLSearchParams();
    if (filters.jobBoardId) params.append('jobBoardId', filters.jobBoardId);
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.enabled !== undefined) params.append('enabled', filters.enabled);

    const queryString = params.toString();
    return this.request(`/admin/remote-jobs/job-board-companies${queryString ? `?${queryString}` : ''}`);
  }

  async createJobBoardCompany(data) {
    return this.request('/admin/remote-jobs/job-board-companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJobBoardCompany(id, data) {
    return this.request(`/admin/remote-jobs/job-board-companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleJobBoardCompany(id) {
    return this.request(`/admin/remote-jobs/job-board-companies/${id}/toggle`, {
      method: 'PUT',
    });
  }

  async deleteJobBoardCompany(id) {
    return this.request(`/admin/remote-jobs/job-board-companies/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Scraping Control
   */
  async triggerScraping(platform = null, companyId = null) {
    return this.request('/admin/remote-jobs/scraping/trigger', {
      method: 'POST',
      body: JSON.stringify({ platform, companyId }),
    });
  }

  async getScrapingStatus() {
    return this.request('/admin/remote-jobs/scraping/status');
  }

  async getScrapingHistory(limit = 50) {
    return this.request(`/admin/remote-jobs/scraping/history?limit=${limit}`);
  }

  /**
   * Cron Configuration
   */
  async getCronConfig() {
    return this.request('/admin/remote-jobs/cron/config');
  }

  async updateCronConfig(expression) {
    return this.request('/admin/remote-jobs/cron/config', {
      method: 'PUT',
      body: JSON.stringify({ expression }),
    });
  }
}

export const remoteJobsAdminService = new RemoteJobsAdminService();
export default remoteJobsAdminService;
