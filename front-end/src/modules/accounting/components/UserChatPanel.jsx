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
        return 'bg-yellow-500/20 text-yellow-400';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'waiting_documents':
        return 'bg-orange-500/20 text-orange-400';
      case 'processing':
        return 'bg-purple-500/20 text-purple-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
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
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 bg-copilot-bg-primary shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-copilot-accent text-white px-6 py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold">Chat com Contador</h2>
              {activeRequest && (
                <p className="text-sm text-white/70 truncate">
                  {activeRequest.requestData?.company_name || 'Empresa'} •{' '}
                  {formatCNPJ(activeRequest.requestData?.cnpj)}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg hover:bg-copilot-accent-hover transition-colors"
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
              <div className="w-64 border-r border-slate-600 overflow-y-auto card-copilot rounded-none">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-copilot-text-secondary mb-3">
                    Minhas Solicitações
                  </h3>
                  <div className="space-y-2">
                    {requests.map((request) => (
                      <button
                        key={request.id}
                        onClick={() => setActiveRequestId(request.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeRequestId === request.id
                            ? 'bg-copilot-accent/20 border-2 border-copilot-accent'
                            : 'card-copilot border-2 border-transparent'
                        }`}
                      >
                        <p className="font-medium text-sm text-copilot-text-primary truncate">
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent mx-auto mb-4"></div>
                    <p className="text-copilot-text-secondary">Carregando solicitações...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full p-4">
                  <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-6 py-4 rounded-lg max-w-md">
                    <p className="font-semibold mb-2">Erro</p>
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={loadRequests}
                      className="mt-4 btn-copilot-primary text-sm"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              ) : requests.length === 0 ? (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="text-center">
                    <svg
                      className="w-24 h-24 mx-auto text-copilot-text-tertiary mb-4"
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
                    <h3 className="text-xl font-semibold text-copilot-text-secondary mb-2">
                      Nenhuma solicitação
                    </h3>
                    <p className="text-copilot-text-tertiary mb-4">
                      Você ainda não tem solicitações de CNPJ.
                    </p>
                    <button
                      onClick={onClose}
                      className="btn-copilot-primary"
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
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="text-center">
                    <p className="text-copilot-text-tertiary">Selecione uma solicitação para conversar</p>
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
