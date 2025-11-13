// Jobs service for fetching remote jobs from PostgreSQL
import { auth } from '../modules/auth-social/services/firebaseAuth';
import { getApiUrl } from '../utils/apiUrl';

class JobsService {

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
      console.error('Jobs API request failed:', error);
      throw error;
    }
  }

  /**
   * Get a single job by ID
   * @param {string} id - Job ID (UUID)
   * @returns {Promise<Object>} Job details
   */
  async getJobById(id) {
    return this.request(`/remote-jobs/job-boards/jobs/${id}`);
  }

  /**
   * Get all jobs with filters and pagination
   * @param {Object} filters - Filter options
   * @param {string} filters.platform - Filter by platform
   * @param {boolean} filters.remote - Filter by remote
   * @param {string} filters.seniority - Filter by seniority level
   * @param {string} filters.employmentType - Filter by employment type
   * @param {string} filters.category - Filter by job category
   * @param {string} filters.jobTitle - Search by job title
   * @param {string} filters.skills - Filter by skills/tags
   * @param {string} filters.benefits - Filter by benefits
   * @param {string} filters.location - Filter by location
   * @param {string} filters.degree - Filter by degree requirement
   * @param {string} filters.minSalary - Filter by minimum salary
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise<Object>} Jobs with pagination info
   */
  async getAllJobs(filters = {}) {
    const params = new URLSearchParams();

    if (filters.platform) params.append('platform', filters.platform);
    if (filters.remote !== undefined) params.append('remote', filters.remote);
    if (filters.seniority) params.append('seniority', filters.seniority);
    // Convert employmentType array to comma-separated string
    if (filters.employmentType && filters.employmentType.length > 0) {
      params.append('employmentType', Array.isArray(filters.employmentType) ? filters.employmentType.join(',') : filters.employmentType);
    }
    if (filters.category) params.append('category', filters.category);
    if (filters.jobTitle) params.append('jobTitle', filters.jobTitle);
    // Convert skills array to comma-separated string
    if (filters.skills && filters.skills.length > 0) {
      params.append('skills', Array.isArray(filters.skills) ? filters.skills.join(',') : filters.skills);
    }
    if (filters.benefits) params.append('benefits', filters.benefits);
    // Convert location array to comma-separated string
    if (filters.location && filters.location.length > 0) {
      params.append('location', Array.isArray(filters.location) ? filters.location.join(',') : filters.location);
    }
    if (filters.degree) params.append('degree', filters.degree);
    if (filters.minSalary) params.append('minSalary', filters.minSalary);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/remote-jobs/job-boards/jobs${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  /**
   * Trigger job boards scraping (ALL sources)
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerScraping() {
    return this.request('/remote-jobs/job-boards/scrape-all', {
      method: 'POST',
    });
  }

  /**
   * Trigger Greenhouse scraping only
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerGreenhouseScraping() {
    return this.request('/remote-jobs/job-boards/scrape-greenhouse', {
      method: 'POST',
    });
  }

  /**
   * Trigger Lever scraping only
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerLeverScraping() {
    return this.request('/remote-jobs/job-boards/scrape-lever', {
      method: 'POST',
    });
  }

  /**
   * Trigger Workable scraping only
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerWorkableScraping() {
    return this.request('/remote-jobs/job-boards/scrape-workable', {
      method: 'POST',
    });
  }

  /**
   * Trigger Ashby scraping only
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerAshbyScraping() {
    return this.request('/remote-jobs/job-boards/scrape-ashby', {
      method: 'POST',
    });
  }

  /**
   * Trigger Wellfound scraping only
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerWellfoundScraping() {
    return this.request('/remote-jobs/job-boards/scrape-wellfound', {
      method: 'POST',
    });
  }

  /**
   * Trigger Built In scraping only
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerBuiltInScraping() {
    return this.request('/remote-jobs/job-boards/scrape-builtin', {
      method: 'POST',
    });
  }

  /**
   * Trigger We Work Remotely scraping only
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerWeWorkRemotelyScraping() {
    return this.request('/remote-jobs/job-boards/scrape-weworkremotely', {
      method: 'POST',
    });
  }

  /**
   * Trigger Remotive scraping only
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerRemotiveScraping() {
    return this.request('/remote-jobs/job-boards/scrape-remotive', {
      method: 'POST',
    });
  }

  /**
   * Trigger RemoteYeah scraping only
   * @returns {Promise<Object>} Scraping statistics
   */
  async triggerRemoteYeahScraping() {
    return this.request('/remote-jobs/job-boards/scrape-remoteyeah', {
      method: 'POST',
    });
  }

  /**
   * Get scraping statistics
   * @returns {Promise<Object>} Scraping stats
   */
  async getScrapingStats() {
    return this.request('/remote-jobs/job-boards/stats');
  }
}

// Create and export a singleton instance
export const jobsService = new JobsService();
export default jobsService;
