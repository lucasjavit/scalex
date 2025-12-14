import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../../services/accountingApi';
import { useUserStatus } from '../../../../hooks/useUserStatus';
import { useNotification } from '../../../../hooks/useNotification';
import { getErrorMessage, ERROR_CONTEXTS } from '../../../../utils/errorHandler';
import BackButton from '../../../../components/BackButton';

const STATUS_LABELS = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  waiting_documents: 'Aguardando Documentos',
  processing: 'Processando',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  waiting_documents: 'bg-purple-500/20 text-purple-400',
  processing: 'bg-indigo-500/20 text-indigo-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function AccountantDashboard() {
  const navigate = useNavigate();
  const { userStatus, loading: userLoading } = useUserStatus();
  const { showSuccess, showError, showWarning, showConfirmation } = useNotification();
  const [activeTab, setActiveTab] = useState('pending'); // pending, active, completed, inactive
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, inactive: 0 });
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancelRequestId, setPendingCancelRequestId] = useState(null);

  // Check if user has accountant role (partner_cnpj or admin)
  const isAccountant = userStatus?.role === 'partner_cnpj' || userStatus?.role === 'admin';

  // Redirect if user is not an accountant
  useEffect(() => {
    if (!userLoading && !isAccountant) {
      navigate('/home');
    }
  }, [userLoading, isAccountant, navigate]);

  useEffect(() => {
    loadAllRequests();
  }, []);

  useEffect(() => {
    loadRequestsByTab(activeTab);
  }, [activeTab]);

  const loadAllRequests = async () => {
    try {
      const [pending, active, completed, inactive] = await Promise.all([
        accountingApi.getAccountantPendingRequests(),
        accountingApi.getAccountantActiveRequests(),
        accountingApi.getAccountantCompletedRequests(),
        accountingApi.getAccountantCancelledRequests(),
      ]);

      setStats({
        pending: pending.length,
        active: active.length,
        completed: completed.length,
        inactive: inactive.length,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadRequestsByTab = async (tab) => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (tab === 'pending') {
        data = await accountingApi.getAccountantPendingRequests();
      } else if (tab === 'active') {
        data = await accountingApi.getAccountantActiveRequests();
      } else if (tab === 'completed') {
        data = await accountingApi.getAccountantCompletedRequests();
      } else {
        // inactive tab
        data = await accountingApi.getAccountantCancelledRequests();
      }

      setRequests(data);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(getErrorMessage(err, ERROR_CONTEXTS.LOAD_REQUESTS));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelfAssign = async (requestId) => {
    try {
      await accountingApi.selfAssignRequest(requestId);
      // Reload all data
      await loadAllRequests();
      await loadRequestsByTab(activeTab);
      showSuccess('Solicitação atribuída a você com sucesso!');
    } catch (err) {
      console.error('Error self-assigning request:', err);
      showError(getErrorMessage(err, ERROR_CONTEXTS.ASSIGN_REQUEST));
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      // If selecting "completed", ask for confirmation about the final status
      if (newStatus === 'completed') {
        showConfirmation(
          'O processo foi concluído com SUCESSO? A empresa foi criada corretamente?',
          async () => {
            // User confirmed success
            await accountingApi.updateRequestStatus(requestId, 'completed');
            await loadAllRequests();
            await loadRequestsByTab(activeTab);
            showSuccess('Solicitação marcada como concluída com sucesso!');
          },
          () => {
            // User said there was a problem - open cancel modal
            setPendingCancelRequestId(requestId);
            setShowCancelModal(true);
          }
        );
        return;
      }

      await accountingApi.updateRequestStatus(requestId, newStatus);
      // Reload all data
      await loadAllRequests();
      await loadRequestsByTab(activeTab);
      showSuccess('Status atualizado com sucesso!');
    } catch (err) {
      console.error('Error updating status:', err);
      showError(getErrorMessage(err, ERROR_CONTEXTS.UPDATE_STATUS));
    }
  };

  const handleCancelWithReason = async () => {
    if (!cancelReason.trim()) {
      showWarning('Por favor, informe o motivo do cancelamento.');
      return;
    }

    try {
      await accountingApi.updateRequestStatus(pendingCancelRequestId, 'cancelled', cancelReason);
      await loadAllRequests();
      await loadRequestsByTab(activeTab);
      showSuccess('Solicitação cancelada com sucesso.');
      setShowCancelModal(false);
      setCancelReason('');
      setPendingCancelRequestId(null);
    } catch (err) {
      console.error('Error cancelling request:', err);
      showError(getErrorMessage(err, ERROR_CONTEXTS.CANCEL_REQUEST));
    }
  };

  // Show loading while checking user role
  if (userLoading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto"></div>
            <p className="mt-4 text-copilot-text-secondary">Verificando permissões...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is not an accountant, show access denied (before redirect)
  if (!isAccountant) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p>Você não tem permissão para acessar esta página.</p>
            <p className="text-sm mt-2">Apenas contadores (Parceiro: Abertura de CNPJ) e administradores podem acessar o dashboard do contador.</p>
            <button
              onClick={() => navigate('/home')}
              className="mt-4 btn-copilot-primary"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Back Button */}
      <BackButton to="/accounting/accountant" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-copilot-text-primary">Solicitações de CNPJ</h1>
        <p className="text-copilot-text-secondary mt-2">Gerencie as solicitações de abertura de empresas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-400 font-medium">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-300 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-yellow-500/20 rounded-full p-3">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-400 font-medium">Ativas</p>
              <p className="text-3xl font-bold text-blue-300 mt-2">{stats.active}</p>
            </div>
            <div className="bg-blue-500/20 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-400 font-medium">Concluídas</p>
              <p className="text-3xl font-bold text-green-300 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-green-500/20 rounded-full p-3">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-400 font-medium">Canceladas</p>
              <p className="text-3xl font-bold text-red-300 mt-2">{stats.inactive}</p>
            </div>
            <div className="bg-red-500/20 rounded-full p-3">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-copilot">
        <div className="border-b border-copilot-border-default">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-transparent text-copilot-text-secondary hover:text-copilot-text-primary hover:border-copilot-border-default'
              }`}
            >
              Pendentes ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-copilot-text-secondary hover:text-copilot-text-primary hover:border-copilot-border-default'
              }`}
            >
              Ativas ({stats.active})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'completed'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-copilot-text-secondary hover:text-copilot-text-primary hover:border-copilot-border-default'
              }`}
            >
              Concluídas ({stats.completed})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'inactive'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-copilot-text-secondary hover:text-copilot-text-primary hover:border-copilot-border-default'
              }`}
            >
              Canceladas ({stats.inactive})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto"></div>
              <p className="mt-4 text-copilot-text-secondary">Carregando solicitações...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded">
              <p className="font-semibold">Erro:</p>
              <p>{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-copilot-bg-tertiary border border-copilot-border-default rounded-lg">
              <svg className="w-16 h-16 mx-auto text-copilot-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-copilot-text-secondary">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-copilot-bg-secondary border border-copilot-border-default rounded-lg p-4 hover:border-copilot-border-focus transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-copilot-text-primary">
                          {request.user?.full_name || request.requestData?.full_name || 'Nome não disponível'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status]}`}>
                          {STATUS_LABELS[request.status]}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-copilot-text-secondary">
                        <div>
                          <span className="font-medium text-copilot-text-tertiary">Tipo:</span> {request.requestData?.preferred_company_type}
                        </div>
                        <div>
                          <span className="font-medium text-copilot-text-tertiary">Urgência:</span> {request.requestData?.urgency}
                        </div>
                        <div>
                          <span className="font-medium text-copilot-text-tertiary">Criado em:</span> {formatDate(request.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium text-copilot-text-tertiary">Email:</span> {request.requestData?.email}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      {/* Show "Atribuir a mim" button for pending requests */}
                      {activeTab === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelfAssign(request.id);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm whitespace-nowrap"
                        >
                          Atribuir a mim
                        </button>
                      )}

                      {/* Show status update dropdown for active requests */}
                      {activeTab === 'active' && (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateStatus(request.id, e.target.value);
                              e.target.value = ''; // Reset select
                            }
                          }}
                          className="input-copilot text-sm cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled>Atualizar Status</option>
                          <option value="waiting_documents">Aguardando Documentos</option>
                          <option value="processing">Processando</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelar</option>
                        </select>
                      )}

                      {/* Show status update dropdown for completed requests (allow reverting) */}
                      {activeTab === 'completed' && (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.value) {
                              const confirmed = window.confirm(
                                'Tem certeza que deseja alterar o status desta solicitação já concluída?\n\n' +
                                'Isso deve ser feito apenas se a marcação anterior estava incorreta.'
                              );
                              if (confirmed) {
                                handleUpdateStatus(request.id, e.target.value);
                              }
                              e.target.value = ''; // Reset select
                            }
                          }}
                          className="px-3 py-2 border border-yellow-500/50 bg-yellow-900/20 rounded text-sm hover:bg-yellow-900/30 cursor-pointer font-medium text-yellow-300"
                          defaultValue=""
                        >
                          <option value="" disabled>Corrigir Status</option>
                          <option value="in_progress">Voltar para Em Andamento</option>
                          <option value="waiting_documents">Aguardando Documentos</option>
                          <option value="processing">Processando</option>
                          <option value="cancelled">Marcar como Cancelado</option>
                        </select>
                      )}

                      {/* Show status update dropdown for cancelled/inactive requests (allow reactivating) */}
                      {activeTab === 'inactive' && (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.value) {
                              const confirmed = window.confirm(
                                'Tem certeza que deseja reativar esta solicitação cancelada?\n\n' +
                                'A solicitação voltará ao status selecionado e aparecerá nas abas ativas.'
                              );
                              if (confirmed) {
                                handleUpdateStatus(request.id, e.target.value);
                              }
                              e.target.value = ''; // Reset select
                            }
                          }}
                          className="px-3 py-2 border border-red-500/50 bg-red-900/20 rounded text-sm hover:bg-red-900/30 cursor-pointer font-medium text-red-300"
                          defaultValue=""
                        >
                          <option value="" disabled>Reativar Solicitação</option>
                          <option value="in_progress">Em Andamento</option>
                          <option value="waiting_documents">Aguardando Documentos</option>
                          <option value="processing">Processando</option>
                          <option value="completed">Concluído</option>
                        </select>
                      )}

                      <button
                        onClick={() => navigate(`/accounting/requests/${request.id}`)}
                        className="btn-copilot-primary text-sm whitespace-nowrap"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="card-copilot p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
              Motivo do Cancelamento
            </h3>
            <p className="text-sm text-copilot-text-secondary mb-4">
              Por favor, informe o motivo do cancelamento (Ex: Cliente desistiu, documentação incorreta, etc.)
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Digite o motivo..."
              className="input-copilot w-full"
              rows={3}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setPendingCancelRequestId(null);
                }}
                className="btn-copilot-secondary"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelWithReason}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition"
              >
                Cancelar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
