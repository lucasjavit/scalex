/**
 * Utility functions for handling API errors consistently across the application.
 *
 * This module provides standardized error messages for common HTTP status codes
 * and error types, making the user experience more consistent and user-friendly.
 */

/**
 * Error messages mapped by HTTP status code
 */
const HTTP_ERROR_MESSAGES = {
  400: 'Dados inválidos. Verifique as informações e tente novamente.',
  401: 'Sessão expirada. Por favor, faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  408: 'A requisição demorou muito tempo. Tente novamente.',
  409: 'Conflito: este registro já existe ou está sendo usado.',
  413: 'O arquivo enviado é muito grande.',
  422: 'Dados inválidos. Verifique os campos preenchidos.',
  429: 'Muitas requisições. Aguarde um momento e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Servidor temporariamente indisponível. Tente novamente.',
  503: 'Serviço indisponível. Tente novamente mais tarde.',
  504: 'O servidor demorou muito para responder. Tente novamente.',
};

/**
 * Error messages for network/connection issues
 */
const NETWORK_ERROR_MESSAGES = {
  'Failed to fetch': 'Erro de conexão. Verifique sua internet e tente novamente.',
  'NetworkError': 'Erro de rede. Verifique sua conexão com a internet.',
  'TypeError: Failed to fetch': 'Não foi possível conectar ao servidor.',
  'AbortError': 'A requisição foi cancelada.',
  'TimeoutError': 'A requisição excedeu o tempo limite.',
};

/**
 * Parses an error and returns a user-friendly message.
 *
 * @param {Error|string|object} error - The error to parse
 * @param {string} defaultMessage - Default message if error cannot be parsed
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error, defaultMessage = 'Ocorreu um erro inesperado. Tente novamente.') {
  // Handle null/undefined
  if (!error) {
    return defaultMessage;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return parseErrorString(error) || defaultMessage;
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for network errors first
    const networkError = checkNetworkError(error.message);
    if (networkError) {
      return networkError;
    }

    // Check for HTTP status code in error message
    const httpError = parseHttpStatusFromMessage(error.message);
    if (httpError) {
      return httpError;
    }

    // Return the error message if it's user-friendly
    if (error.message && isUserFriendlyMessage(error.message)) {
      return error.message;
    }
  }

  // Handle response objects with status codes
  if (error.status || error.statusCode) {
    const statusCode = error.status || error.statusCode;
    const httpMessage = HTTP_ERROR_MESSAGES[statusCode];
    if (httpMessage) {
      return httpMessage;
    }
  }

  // Handle objects with message property
  if (error.message) {
    const networkError = checkNetworkError(error.message);
    if (networkError) {
      return networkError;
    }

    if (isUserFriendlyMessage(error.message)) {
      return error.message;
    }
  }

  // Handle objects with error property
  if (error.error) {
    if (typeof error.error === 'string' && isUserFriendlyMessage(error.error)) {
      return error.error;
    }
  }

  return defaultMessage;
}

/**
 * Checks if the error is a network-related error.
 *
 * @param {string} message - Error message to check
 * @returns {string|null} Network error message or null
 */
function checkNetworkError(message) {
  if (!message) return null;

  for (const [key, value] of Object.entries(NETWORK_ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return value;
    }
  }

  // Check for generic network-related terms
  if (message.toLowerCase().includes('network')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  return null;
}

/**
 * Parses HTTP status codes from error messages.
 *
 * @param {string} message - Error message to parse
 * @returns {string|null} HTTP error message or null
 */
function parseHttpStatusFromMessage(message) {
  if (!message) return null;

  // Look for status codes in message
  for (const [statusCode, errorMessage] of Object.entries(HTTP_ERROR_MESSAGES)) {
    if (message.includes(statusCode) || message.includes(`status ${statusCode}`)) {
      return errorMessage;
    }
  }

  // Check for common HTTP error phrases
  if (message.includes('Unauthorized') || message.includes('unauthorized')) {
    return HTTP_ERROR_MESSAGES[401];
  }
  if (message.includes('Forbidden') || message.includes('forbidden')) {
    return HTTP_ERROR_MESSAGES[403];
  }
  if (message.includes('Not Found') || message.includes('Cannot GET') || message.includes('Cannot POST')) {
    return HTTP_ERROR_MESSAGES[404];
  }
  if (message.includes('Internal Server Error')) {
    return HTTP_ERROR_MESSAGES[500];
  }

  return null;
}

/**
 * Parses string errors for known patterns.
 *
 * @param {string} errorString - Error string to parse
 * @returns {string|null} Parsed error message or null
 */
function parseErrorString(errorString) {
  const networkError = checkNetworkError(errorString);
  if (networkError) {
    return networkError;
  }

  const httpError = parseHttpStatusFromMessage(errorString);
  if (httpError) {
    return httpError;
  }

  if (isUserFriendlyMessage(errorString)) {
    return errorString;
  }

  return null;
}

/**
 * Checks if a message appears to be user-friendly (not a stack trace or technical error).
 *
 * @param {string} message - Message to check
 * @returns {boolean} True if message appears user-friendly
 */
function isUserFriendlyMessage(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  // Reject messages that look like stack traces or technical errors
  const technicalPatterns = [
    /^Error:/i,
    /at\s+\w+\s+\(/,
    /\.js:\d+:\d+/,
    /TypeError:/i,
    /ReferenceError:/i,
    /SyntaxError:/i,
    /undefined is not/i,
    /null is not/i,
    /Cannot read property/i,
    /Cannot read properties/i,
    /__webpack/,
    /node_modules/,
  ];

  for (const pattern of technicalPatterns) {
    if (pattern.test(message)) {
      return false;
    }
  }

  // Accept messages that look user-friendly
  // User-friendly messages typically start with capital letters and don't contain code references
  return message.length > 0 && message.length < 500;
}

/**
 * Creates a standardized error handler for async operations.
 *
 * @param {object} options - Configuration options
 * @param {function} options.onError - Callback for errors (receives user-friendly message)
 * @param {function} options.onNetworkError - Optional callback specifically for network errors
 * @param {function} options.onAuthError - Optional callback for authentication errors (401/403)
 * @param {string} options.defaultMessage - Default error message
 * @returns {function} Error handler function
 */
export function createErrorHandler(options = {}) {
  const {
    onError,
    onNetworkError,
    onAuthError,
    defaultMessage = 'Ocorreu um erro inesperado. Tente novamente.',
  } = options;

  return (error) => {
    console.error('Error caught by handler:', error);

    // Check for network errors
    if (error instanceof Error && checkNetworkError(error.message)) {
      const message = checkNetworkError(error.message);
      if (onNetworkError) {
        onNetworkError(message, error);
      } else if (onError) {
        onError(message, error);
      }
      return message;
    }

    // Check for auth errors
    const statusCode = error?.status || error?.statusCode;
    if (statusCode === 401 || statusCode === 403 ||
        error?.message?.includes('401') || error?.message?.includes('Unauthorized') ||
        error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
      const message = HTTP_ERROR_MESSAGES[statusCode === 403 ? 403 : 401];
      if (onAuthError) {
        onAuthError(message, error);
      } else if (onError) {
        onError(message, error);
      }
      return message;
    }

    // Get user-friendly message
    const message = getErrorMessage(error, defaultMessage);
    if (onError) {
      onError(message, error);
    }
    return message;
  };
}

/**
 * Maps specific error contexts to more descriptive messages.
 * Use this for domain-specific error handling.
 */
export const ERROR_CONTEXTS = {
  // Accounting module contexts
  LOAD_REQUESTS: 'Erro ao carregar solicitações',
  LOAD_COMPANIES: 'Erro ao carregar empresas',
  LOAD_DOCUMENTS: 'Erro ao carregar documentos',
  LOAD_TAXES: 'Erro ao carregar impostos',

  CREATE_REQUEST: 'Erro ao criar solicitação',
  UPDATE_REQUEST: 'Erro ao atualizar solicitação',
  CANCEL_REQUEST: 'Erro ao cancelar solicitação',

  UPLOAD_DOCUMENT: 'Erro ao enviar documento',
  DELETE_DOCUMENT: 'Erro ao excluir documento',
  DOWNLOAD_DOCUMENT: 'Erro ao baixar documento',

  UPLOAD_TAX: 'Erro ao enviar imposto',
  CREATE_TAX: 'Erro ao criar imposto',
  PAY_TAX: 'Erro ao registrar pagamento',

  ASSIGN_REQUEST: 'Erro ao atribuir solicitação',
  UPDATE_STATUS: 'Erro ao atualizar status',

  SEARCH_COMPANIES: 'Erro ao buscar empresas',
  CREATE_COMPANY: 'Erro ao criar empresa',
};

/**
 * Gets an error message with context prefix.
 *
 * @param {Error|string|object} error - The error to parse
 * @param {string} context - Context from ERROR_CONTEXTS
 * @returns {string} Contextualized error message
 */
export function getContextualErrorMessage(error, context) {
  const baseMessage = getErrorMessage(error);

  // If the base message already has context (like "Sessão expirada"), return it directly
  if (baseMessage.includes('Sessão') || baseMessage.includes('permissão') || baseMessage.includes('conexão')) {
    return baseMessage;
  }

  // Add context prefix for generic messages
  if (context && baseMessage !== 'Ocorreu um erro inesperado. Tente novamente.') {
    return `${context}: ${baseMessage}`;
  }

  return context ? `${context}. Tente novamente.` : baseMessage;
}

export default {
  getErrorMessage,
  createErrorHandler,
  getContextualErrorMessage,
  ERROR_CONTEXTS,
};
