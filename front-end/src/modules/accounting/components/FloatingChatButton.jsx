import { useState, useEffect } from 'react';
import { accountingApi } from '../../../services/accountingApi';

/**
 * FloatingChatButton
 *
 * Floating action button (FAB) for opening the unified chat panel.
 * Shows unread message count badge.
 * Fixed position at bottom-right corner.
 * Visible on all accountant pages.
 *
 * Props:
 * - onClick: Function to call when button is clicked
 * - isOpen: Boolean indicating if chat panel is open
 */
export default function FloatingChatButton({ onClick, isOpen }) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Load unread count on mount and every 10 seconds
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await accountingApi.getUnreadMessageCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 ${
        isOpen
          ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-300'
          : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-300'
      }`}
      aria-label="Abrir chat"
    >
      {/* Chat Icon */}
      <div className="relative">
        <svg
          className="w-8 h-8 mx-auto text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            // X icon when open
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            // Chat bubble icon when closed
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          )}
        </svg>

        {/* Unread Count Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}
