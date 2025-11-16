// API service for Accounting module (Company Registration Requests)
import { auth } from '../modules/auth-social/services/firebaseAuth';
import { getApiUrl } from '../utils/apiUrl';

class AccountingApiService {
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
        ...(token && { Authorization: `Bearer ${token}` }),
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
          throw new Error('Não autenticado. Faça login novamente.');
        }

        if (response.status === 403) {
          throw new Error(errorData.message || 'Você não tem permissão para acessar este recurso.');
        }

        if (response.status === 404) {
          throw new Error(errorData.message || 'Solicitação não encontrada.');
        }

        throw new Error(errorData.message || `Erro HTTP! Status: ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        return null;
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Erro ao parsear JSON:', parseError);
        return null;
      }
    } catch (error) {
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        const connectionError = new Error(
          'Erro de conexão. Verifique se o servidor está rodando.',
        );
        connectionError.originalError = error;
        console.error('Falha na requisição:', connectionError);
        throw connectionError;
      }
      console.error('Falha na requisição:', error);
      throw error;
    }
  }

  /**
   * Create a new company registration request
   * @param {Object} requestData - Request data from form
   * @returns {Promise<Object>} Created request
   */
  async createRequest(requestData) {
    return this.request('/accounting/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  /**
   * Get all requests for the authenticated user
   * @returns {Promise<Array>} User's requests
   */
  async getMyRequests() {
    return this.request('/accounting/requests/my-requests');
  }

  /**
   * Get all requests assigned to the authenticated accountant
   * @returns {Promise<Array>} Accountant's assigned requests
   */
  async getMyAssignedRequests() {
    return this.request('/accounting/requests/accountant/my-assigned');
  }

  /**
   * Get a specific request by ID
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>} Request details
   */
  async getRequestById(requestId) {
    return this.request(`/accounting/requests/${requestId}`);
  }

  /**
   * Update the status of a request
   * @param {string} requestId - Request ID
   * @param {string} status - New status
   * @param {string} statusNote - Optional status note
   * @returns {Promise<Object>} Updated request
   */
  async updateRequestStatus(requestId, status, statusNote = null) {
    return this.request(`/accounting/requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        ...(statusNote && { status_note: statusNote }),
      }),
    });
  }

  /**
   * Assign an accountant to a request (admin only)
   * @param {string} requestId - Request ID
   * @param {string} accountantId - Accountant user ID
   * @returns {Promise<Object>} Updated request
   */
  async assignAccountant(requestId, accountantId) {
    return this.request(`/accounting/requests/${requestId}/assign/${accountantId}`, {
      method: 'PATCH',
    });
  }

  /**
   * Cancel a request (user can cancel their own request)
   * @param {string} requestId - Request ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated request
   */
  async cancelRequest(requestId, reason = null) {
    return this.updateRequestStatus(requestId, 'cancelled', reason);
  }

  // ========================================
  // ACCOUNTANT DASHBOARD METHODS
  // ========================================

  /**
   * Get pending requests for the authenticated accountant
   * @returns {Promise<Array>} Array of pending requests
   */
  async getAccountantPendingRequests() {
    return this.request('/accounting/requests/accountant/pending');
  }

  /**
   * Get active requests for the authenticated accountant
   * @returns {Promise<Array>} Array of active requests (in_progress, waiting_documents, processing)
   */
  async getAccountantActiveRequests() {
    return this.request('/accounting/requests/accountant/active');
  }

  /**
   * Get completed/cancelled requests for the authenticated accountant
   * @returns {Promise<Array>} Array of completed/cancelled requests
   */
  async getAccountantCompletedRequests() {
    return this.request('/accounting/requests/accountant/completed');
  }

  // ==================== MESSAGING METHODS ====================

  /**
   * Send a message
   * @param {Object} messageData - Message data
   * @param {string} messageData.requestId - Request ID (optional)
   * @param {string} messageData.companyId - Company ID (optional)
   * @param {string} messageData.receiverId - Receiver user ID
   * @param {string} messageData.message - Message content
   * @param {string} messageData.attachment - Attachment path (optional)
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(messageData) {
    return this.request('/accounting/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  /**
   * Get messages for a request
   * @param {string} requestId - Request ID
   * @returns {Promise<Array>} Array of messages
   */
  async getMessagesByRequest(requestId) {
    return this.request(`/accounting/messages/request/${requestId}`);
  }

  /**
   * Get messages for a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Array of messages
   */
  async getMessagesByCompany(companyId) {
    return this.request(`/accounting/messages/company/${companyId}`);
  }

  /**
   * Mark a message as read
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async markMessageAsRead(messageId) {
    return this.request(`/accounting/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  }

  /**
   * Get count of unread messages
   * @returns {Promise<Object>} Object with count property
   */
  async getUnreadMessageCount() {
    return this.request('/accounting/messages/unread-count');
  }

  // ========================================
  // DOCUMENT METHODS
  // ========================================

  /**
   * Upload a document for a registration request
   * @param {string} requestId - Request ID
   * @param {File} file - File to upload
   * @param {string} documentType - Type of document (e.g., "RG", "CPF")
   * @returns {Promise<Object>} Created document record
   */
  async uploadDocument(requestId, file, documentType) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId);
    formData.append('documentType', documentType);

    const response = await fetch(`${this.baseUrl}/accounting/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it automatically with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload document');
    }

    return response.json();
  }

  /**
   * Get documents for a registration request
   * @param {string} requestId - Request ID
   * @returns {Promise<Array>} Array of documents
   */
  async getRequestDocuments(requestId) {
    return this.request(`/accounting/documents/request/${requestId}`);
  }

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(documentId) {
    return this.request(`/accounting/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get download path for a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Object with filePath property
   */
  async getDocumentDownloadPath(documentId) {
    return this.request(`/accounting/documents/${documentId}/download`);
  }

  // ========================================
  // COMPANY METHODS
  // ========================================

  /**
   * Create a company from a registration request
   * @param {string} requestId - Request ID
   * @param {Object} companyData - Company information
   * @returns {Promise<Object>} Created company
   */
  async createCompany(requestId, companyData) {
    return this.request(`/accounting/companies/${requestId}`, {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  /**
   * Get all companies owned by authenticated user
   * @returns {Promise<Array>} Array of user's companies
   */
  async getMyCompanies() {
    return this.request('/accounting/companies/my-companies');
  }

  /**
   * Get all companies managed by authenticated accountant
   * @param {string} status - Optional status filter (active, inactive, suspended)
   * @returns {Promise<Array>} Array of accountant's companies
   */
  async getAccountantCompanies(status = null) {
    const queryString = status ? `?status=${status}` : '';
    return this.request(`/accounting/companies/accountant${queryString}`);
  }

  /**
   * Get detailed information about a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Company details
   */
  async getCompanyById(companyId) {
    return this.request(`/accounting/companies/${companyId}`);
  }

  /**
   * Update company information
   * @param {string} companyId - Company ID
   * @param {Object} updateData - Partial company data to update
   * @returns {Promise<Object>} Updated company
   */
  async updateCompany(companyId, updateData) {
    return this.request(`/accounting/companies/${companyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // ========================================
  // TAX OBLIGATION METHODS
  // ========================================

  /**
   * Create a tax obligation for a company
   * @param {Object} taxData - Tax obligation data
   * @returns {Promise<Object>} Created tax obligation
   */
  async createTaxObligation(taxData) {
    return this.request('/accounting/tax-obligations', {
      method: 'POST',
      body: JSON.stringify(taxData),
    });
  }

  /**
   * Get all tax obligations for a specific company
   * @param {string} companyId - Company ID
   * @param {string} status - Optional status filter (pending, paid, overdue, cancelled)
   * @returns {Promise<Array>} Array of tax obligations
   */
  async getCompanyTaxObligations(companyId, status = null) {
    const queryString = status ? `?status=${status}` : '';
    return this.request(`/accounting/tax-obligations/company/${companyId}${queryString}`);
  }

  /**
   * Get a single tax obligation by ID
   * @param {string} taxId - Tax obligation ID
   * @returns {Promise<Object>} Tax obligation details
   */
  async getTaxObligationById(taxId) {
    return this.request(`/accounting/tax-obligations/${taxId}`);
  }

  /**
   * Confirm payment of a tax obligation
   * @param {string} taxId - Tax obligation ID
   * @param {Object} paymentData - Payment confirmation data (paidAmount, paymentConfirmation)
   * @returns {Promise<Object>} Updated tax obligation
   */
  async confirmTaxPayment(taxId, paymentData) {
    return this.request(`/accounting/tax-obligations/${taxId}/confirm-payment`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Update a tax obligation
   * @param {string} taxId - Tax obligation ID
   * @param {Object} updateData - Partial tax obligation data to update
   * @returns {Promise<Object>} Updated tax obligation
   */
  async updateTaxObligation(taxId, updateData) {
    return this.request(`/accounting/tax-obligations/${taxId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Cancel a tax obligation
   * @param {string} taxId - Tax obligation ID
   * @returns {Promise<Object>} Cancelled tax obligation
   */
  async cancelTaxObligation(taxId) {
    return this.request(`/accounting/tax-obligations/${taxId}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
export const accountingApi = new AccountingApiService();
export default accountingApi;
