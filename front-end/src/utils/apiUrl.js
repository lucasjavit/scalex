/**
 * Helper function to construct API URLs correctly
 * Handles both local development (using Vite proxy) and production
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/users/firebase/...')
 * @returns {string} - The complete URL with proper /api prefix
 */
export function getApiUrl(endpoint) {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is NOT set, use relative path to leverage Vite proxy
  // This works in development (Vite proxy forwards to localhost:3000)
  // and in production if using a reverse proxy
  if (!viteApiUrl) {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `/api${normalizedEndpoint}`;
  }
  
  // If VITE_API_URL is explicitly set, use it (for production or custom setup)
  let baseURL = viteApiUrl;
  
  // Ensure baseURL ends with /api
  if (!baseURL.endsWith('/api')) {
    // Remove trailing slash if present
    baseURL = baseURL.replace(/\/$/, '');
    baseURL = `${baseURL}/api`;
  }

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseURL}${normalizedEndpoint}`;
}

/**
 * Get the base URL for API requests
 * @returns {string} - The base URL
 */
export function getBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
}

