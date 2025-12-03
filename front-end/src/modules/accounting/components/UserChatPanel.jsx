import { useState, useEffect } from 'react';
import { accountingApi } from '../../../services/accountingApi';
import ChatBox from './ChatBox';

/**
 * UserChatPanel
 *
 * Chat panel for users to talk with their accountant.
 * Shows user's requests and allows chatting for each one.
 *
 * Props:
 * - isOpen: Boolean to control panel visibility
 * - onClose: Callback to close the panel
 * - currentUserId: Current logged-in user ID
 */
export default function UserChatPanel({ isOpen, onClose, currentUserId }) {
  const [requests, setRequests] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's requests when panel opens
  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountingApi.getMyRequests();
      setRequests(data || []);

      // Auto-select first request if available
      if (!activeRequestId && data && data.length > 0) {
        setActiveRequestId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Erro ao carregar solicitações: ' + err.message);
    } finally {
      setLoading(false);
    }
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

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return 'N/A';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  // Get active request details
  const activeRequest = requests.find((req) => req.id === activeRequestId);

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
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold">Chat com Contador</h2>
              {activeRequest && (
                <p className="text-sm text-blue-100 truncate">
                  {activeRequest.requestData?.company_name || 'Empresa'} •{' '}
                  {formatCNPJ(activeRequest.requestData?.cnpj)}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg hover:bg-blue-700 transition-colors"
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

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left Sidebar: Request List (only show if multiple requests) */}
            {requests.length > 1 && (
              <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Minhas Solicitações
                  </h3>
                  <div className="space-y-2">
                    {requests.map((request) => (
                      <button
                        key={request.id}
                        onClick={() => setActiveRequestId(request.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeRequestId === request.id
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-white border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {request.requestData?.company_name || 'Empresa sem nome'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(
                              request.status
                            )}`}
                          >
                            {getStatusLabel(request.status)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando solicitações...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full p-4">
                  <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg max-w-md">
                    <p className="font-semibold mb-2">Erro</p>
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={loadRequests}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              ) : requests.length === 0 ? (
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Nenhuma solicitação
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Você ainda não tem solicitações de CNPJ.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Criar Solicitação
                    </button>
                  </div>
                </div>
              ) : activeRequest ? (
                <ChatBox
                  requestId={activeRequestId}
                  receiverId={activeRequest.assignedToId}
                  currentUserId={currentUserId}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <p className="text-gray-500">Selecione uma solicitação para conversar</p>
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
