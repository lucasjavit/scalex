import { useState } from 'react';

/**
 * ConversationList
 *
 * Left column of the unified chat panel.
 * Shows list of all conversations (registration requests with messages).
 * Features:
 * - Search/filter by company name, CNPJ, or user name
 * - Last message preview
 * - Unread count badges
 * - Sorted by most recent message
 * - Click to select conversation
 *
 * Props:
 * - conversations: Array of request objects with messages
 * - activeRequestId: Currently selected request ID
 * - onSelectConversation: Callback when conversation is clicked
 */
export default function ConversationList({ conversations, activeRequestId, onSelectConversation }) {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return 'N/A';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'waiting_documents':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      waiting_documents: 'Aguardando Docs',
      processing: 'Processando',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  // Filter conversations
  const filteredConversations = conversations.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.request.companyName?.toLowerCase().includes(searchLower) ||
      item.request.cnpj?.includes(searchTerm) ||
      item.request.user?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Conversas</h2>

        {/* Search Bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-3"
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
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((item) => (
              <button
                key={item.request.id}
                onClick={() => onSelectConversation(item.request.id)}
                className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                  activeRequestId === item.request.id
                    ? 'bg-purple-50 border-l-4 border-purple-600'
                    : 'border-l-4 border-transparent'
                }`}
              >
                {/* Company Name and Time */}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate flex-1 pr-2">
                    {item.request.companyName}
                  </h3>
                  {item.lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDate(item.lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                {/* CNPJ and Status */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-600">{formatCNPJ(item.request.cnpj)}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeColor(
                      item.request.status
                    )}`}
                  >
                    {getStatusLabel(item.request.status)}
                  </span>
                </div>

                {/* Last Message Preview */}
                {item.lastMessage && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1 pr-2">
                      <span className="font-medium">
                        {item.lastMessage.isFromAccountant ? 'Você' : item.lastMessage.senderName}:
                      </span>{' '}
                      {item.lastMessage.message}
                    </p>
                    {item.unreadCount > 0 && (
                      <span className="flex-shrink-0 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredConversations.length > 0 && (
        <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {filteredConversations.length}{' '}
              {filteredConversations.length === 1 ? 'conversa' : 'conversas'}
            </span>
            <span>
              {conversations.reduce((sum, item) => sum + item.unreadCount, 0)} não lidas
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
