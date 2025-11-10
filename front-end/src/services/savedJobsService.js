// SavedJobs service for managing user's saved jobs
import { auth } from '../modules/auth-social/services/firebaseAuth';
import { getApiUrl } from '../utils/apiUrl';

class SavedJobsService {

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

    // Get Firebase auth token
    const token = await this.getAuthToken();

    // Get userId from localStorage
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
      console.error('SavedJobs API request failed:', error);
      throw error;
    }
  }

  /**
   * Save a job for the user
   * @param {string} userId - User ID
   * @param {Object} scrapedJob - Job data from scraping (Redis)
   * @returns {Promise<Object>} Saved job with all details
   */
  async saveJob(userId, scrapedJob) {
    return this.request('/remote-jobs/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        scrapedJob,
      }),
    });
  }

  /**
   * Get all saved jobs for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} List of saved jobs with pagination info
   */
  async getSavedJobs(userId) {
    return this.request(`/remote-jobs/saved-jobs/${userId}`);
  }

  /**
   * Get a specific saved job
   * @param {string} userId - User ID
   * @param {string} savedJobId - Saved job ID
   * @returns {Promise<Object>} Saved job details
   */
  async getSavedJob(userId, savedJobId) {
    return this.request(`/remote-jobs/saved-jobs/${userId}/${savedJobId}`);
  }

  /**
   * Update status of a saved job
   * @param {string} userId - User ID
   * @param {string} savedJobId - Saved job ID
   * @param {string} status - New status ('saved' | 'applied' | 'interviewing' | 'rejected' | 'accepted')
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Updated saved job
   */
  async updateJobStatus(userId, savedJobId, status, notes = undefined) {
    return this.request(`/remote-jobs/saved-jobs/${userId}/${savedJobId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        ...(notes !== undefined && { notes }),
      }),
    });
  }

  /**
   * Delete a saved job
   * @param {string} userId - User ID
   * @param {string} savedJobId - Saved job ID
   * @returns {Promise<void>}
   */
  async deleteSavedJob(userId, savedJobId) {
    return this.request(`/remote-jobs/saved-jobs/${userId}/${savedJobId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Helper: Check if a job is already saved
   * @param {string} userId - User ID
   * @param {string} externalId - Job external ID
   * @param {string} platform - Job platform
   * @returns {Promise<boolean>} True if job is already saved
   */
  async isJobSaved(userId, externalId, platform) {
    try {
      const response = await this.getSavedJobs(userId);
      if (!response || !response.data) return false;

      return response.data.some(
        savedJob =>
          savedJob.job.externalId === externalId &&
          savedJob.job.platform === platform
      );
    } catch (error) {
      console.error('Error checking if job is saved:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const savedJobsService = new SavedJobsService();
export default savedJobsService;
