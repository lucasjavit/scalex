/**
 * Helper function to construct API URLs correctly
 * Handles both local development (http://localhost:3000) and production (/api)
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/english-learning/video-call/feature-availability')
 * @returns {string} - The complete URL with proper /api prefix
 */
export function getApiUrl(endpoint) {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // baseURL already includes /api prefix
  // Just concatenate the endpoint
  return `${baseURL}${endpoint}`;
}

/**
 * Get the base URL for API requests
 * @returns {string} - The base URL
 */
export function getBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
}

