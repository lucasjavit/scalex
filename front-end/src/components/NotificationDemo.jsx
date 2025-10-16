import React from 'react';
import { useNotification } from '../hooks/useNotification';

const NotificationDemo = () => {
  const { showSuccess, showError, showWarning, showInfo, showConfirmation } = useNotification();

  const handleSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleError = () => {
    showError('Something went wrong. Please try again.');
  };

  const handleWarning = () => {
    showWarning('Please check your input before proceeding.');
  };

  const handleInfo = () => {
    showInfo('Here is some useful information for you.');
  };

  const handleConfirmation = () => {
    showConfirmation(
      'Are you sure you want to delete this item? This action cannot be undone.',
      () => {
        showSuccess('Item deleted successfully!');
      },
      () => {
        showInfo('Deletion cancelled.');
      }
    );
  };

  return (
    <div className="p-8 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot">
      <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
        Notification System Demo
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={handleSuccess}
          className="btn-copilot-primary bg-green-600 hover:bg-green-700"
        >
          Show Success
        </button>
        
        <button
          onClick={handleError}
          className="btn-copilot-primary bg-red-600 hover:bg-red-700"
        >
          Show Error
        </button>
        
        <button
          onClick={handleWarning}
          className="btn-copilot-primary bg-yellow-600 hover:bg-yellow-700"
        >
          Show Warning
        </button>
        
        <button
          onClick={handleInfo}
          className="btn-copilot-primary bg-blue-600 hover:bg-blue-700"
        >
          Show Info
        </button>
        
        <button
          onClick={handleConfirmation}
          className="btn-copilot-primary bg-purple-600 hover:bg-purple-700"
        >
          Show Confirmation
        </button>
      </div>
    </div>
  );
};

export default NotificationDemo;
