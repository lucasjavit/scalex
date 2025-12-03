import { useState, useEffect } from 'react';
import { messagingApi } from '../../services/messagingApi';
import ChatWindow from './ChatWindow';

export default function PartnerChatPanel({ isOpen, onToggle, moduleConfig, partnerId }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isOpen, moduleConfig]);

  const loadConversations = async () => {
    try {
      const data = await messagingApi.getConversationsForPartner(moduleConfig.moduleType);
      setConversations(data || []);
      if (data?.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
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

  const filteredConversations = conversations.filter((conv) =>
    conv.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 bg-gradient-to-br from-blue-600 to-gray-700 hover:from-blue-700 hover:to-gray-800 text-white text-3xl flex items-center justify-center"
      >
        <span className="text-3xl">{isOpen ? '✕' : '💬'}</span>
        {!isOpen && unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white ${moduleConfig.colors.badge} rounded-full`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[500px] h-[600px] bg-white rounded-lg shadow-2xl flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-1/3 border-r flex flex-col flex-shrink-0">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-semibold text-sm text-gray-900 mb-2">Conversas</h3>
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.user.id}
                onClick={() => setActiveConversation(conv)}
                className={`p-3 cursor-pointer hover:bg-gray-50 border-b ${activeConversation?.user.id === conv.user.id ? 'bg-blue-50' : ''}`}
              >
                <div className="font-medium text-sm truncate text-gray-900">{conv.user.fullName}</div>
                {conv.unreadCount > 0 && (
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{conv.unreadCount}</span>
                )}
              </div>
            ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 min-w-0 flex flex-col">
            {activeConversation ? (
              <ChatWindow
                conversationId={activeConversation.conversationId}
                receiverId={activeConversation.user.id}
                receiverName={activeConversation.user.fullName}
                moduleType={moduleConfig.moduleType}
                currentUserId={partnerId}
                onMessageSent={loadConversations}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Selecione uma conversa
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
