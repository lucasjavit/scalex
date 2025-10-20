import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import NotificationPopup from './NotificationPopup';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="space-y-3 max-w-sm w-full pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationPopup
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
