import { useNotification as useNotificationContext } from '../contexts/NotificationContext';

export const useNotification = () => {
  const context = useNotificationContext();
  
  // Add some convenience methods for common patterns
  const showApiError = (error, customMessage = null) => {
    const message = customMessage || 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';
    
    return context.showError(message, {
      title: 'API Error',
      duration: 8000
    });
  };

  const showApiSuccess = (message, title = 'Success') => {
    return context.showSuccess(message, {
      title,
      duration: 4000
    });
  };

  const showLoading = (message = 'Loading...') => {
    return context.showInfo(message, {
      title: 'Please wait',
      duration: 0, // Don't auto-dismiss
      showCloseButton: false
    });
  };

  const showConfirmation = (message, onConfirm, onCancel = null) => {
    const notificationId = context.addNotification({
      type: 'warning',
      title: '⚠️ Confirmação Necessária',
      message,
      duration: 0, // Don't auto-dismiss
      showCloseButton: true,
      actions: [
        {
          label: 'Cancelar',
          onClick: () => {
            context.removeNotification(notificationId);
            if (onCancel) onCancel();
          },
          className: 'bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-all'
        },
        {
          label: 'Confirmar',
          onClick: () => {
            context.removeNotification(notificationId);
            onConfirm();
          },
          className: 'bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-all'
        }
      ]
    });
    
    return notificationId;
  };

  return {
    ...context,
    showApiError,
    showApiSuccess,
    showLoading,
    showConfirmation
  };
};
