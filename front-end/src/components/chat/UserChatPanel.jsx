import { useState, useEffect } from 'react';
import { messagingApi } from '../../services/messagingApi';
import ChatWindow from './ChatWindow';

export default function UserChatPanel({ isOpen, onToggle, moduleConfig, userId }) {
  const [conversation, setConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadConversation();
    }
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isOpen, moduleConfig]);

  const loadConversation = async () => {
    try {
      const data = await messagingApi.getConversationForUser(moduleConfig.moduleType);
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await messagingApi.getUnreadCount(moduleConfig.moduleType);
      setUnreadCount(data?.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 bg-gradient-to-br from-blue-600 to-gray-700 hover:from-blue-700 hover:to-gray-800 text-white text-3xl flex items-center justify-center"
      >
        <span className="text-3xl">{isOpen ? '✕' : '💬'}</span>
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && conversation && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white rounded-lg shadow-2xl">
          <ChatWindow
            conversationId={conversation.conversationId}
            receiverId={conversation.partner.id}
            receiverName={conversation.partner.fullName}
            moduleType={moduleConfig.moduleType}
            currentUserId={userId}
            onMessageSent={loadConversation}
          />
        </div>
      )}
    </>
  );
}
