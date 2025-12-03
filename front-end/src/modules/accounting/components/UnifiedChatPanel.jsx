import { useState, useEffect } from 'react';
import { accountingApi } from '../../../services/accountingApi';
import ConversationList from './ConversationList';
import ChatBox from './ChatBox';

/**
 * UnifiedChatPanel
 *
 * WhatsApp/Telegram-style unified chat interface for accountants.
 * Two-column layout:
 * - Left: Conversation list (all requests with messages)
 * - Right: Active chat (selected conversation using ChatBox component)
 *
 * Props:
 * - isOpen: Boolean to control panel visibility
 * - onClose: Callback to close the panel
 * - currentUserId: Current logged-in accountant ID
 */
export default function UnifiedChatPanel({ isOpen, onClose, currentUserId }) {
  const [conversations, setConversations] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load conversations when panel opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
      // Refresh conversations every 15 seconds
      const interval = setInterval(loadConversations, 15000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadConversations = async () => {
    try {
      setError(null);
      const data = await accountingApi.getAccountantRequestsWithMessages();
      setConversations(data || []);

      // If no active conversation, select the first one
      if (!activeRequestId && data && data.length > 0) {
        setActiveRequestId(data[0].request.id);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Erro ao carregar conversas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (requestId) => {
    setActiveRequestId(requestId);
  };

  // Get active conversation details
  const activeConversation = conversations.find(
    (conv) => conv.request.id === activeRequestId
  );

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="flex h-full">
          {/* Left Column: Conversation List */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 border-r border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando conversas...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  <p className="font-semibold mb-2">Erro</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={loadConversations}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                activeRequestId={activeRequestId}
                onSelectConversation={handleSelectConversation}
              />
            )}
          </div>

          {/* Right Column: Active Chat */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="flex-shrink-0 bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
              {activeConversation ? (
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold truncate">
                    {activeConversation.request.companyName}
                  </h2>
                  <p className="text-sm text-purple-100 truncate">
                    {activeConversation.request.user.full_name} •{' '}
                    {activeConversation.request.cnpj}
                  </p>
                </div>
              ) : (
                <div className="flex-1">
                  <h2 className="text-lg font-bold">Chat</h2>
                  <p className="text-sm text-purple-100">
                    Selecione uma conversa para começar
                  </p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-lg hover:bg-purple-700 transition-colors"
                aria-label="Fechar chat"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              {activeConversation ? (
                <ChatBox
                  requestId={activeRequestId}
                  receiverId={activeConversation.request.user.id}
                  currentUserId={currentUserId}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <svg
                      className="w-24 h-24 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-500">
                      Escolha uma solicitação da lista para ver as mensagens
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
