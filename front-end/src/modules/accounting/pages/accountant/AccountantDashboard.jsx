import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../../services/accountingApi';
import { useUserStatus } from '../../../../hooks/useUserStatus';
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
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_documents: 'bg-purple-100 text-purple-800',
  processing: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AccountantDashboard() {
  const navigate = useNavigate();
  const { userStatus, loading: userLoading } = useUserStatus();
  const [activeTab, setActiveTab] = useState('pending'); // pending, active, completed, inactive
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, inactive: 0 });

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
      setError('Erro ao carregar solicitações: ' + err.message);
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
    } catch (err) {
      console.error('Error self-assigning request:', err);
      alert('Erro ao atribuir solicitação: ' + err.message);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      // If selecting "completed", ask for confirmation about the final status
      if (newStatus === 'completed') {
        const finalStatus = window.confirm(
          '✅ O processo foi concluído com SUCESSO?\n\n' +
          'Clique "OK" se a empresa foi criada com sucesso.\n' +
          'Clique "Cancelar" se houve algum problema/erro no processo.'
        );

        // If user clicked "OK" -> completed (success)
        // If user clicked "Cancel" -> cancelled (error/problem)
        newStatus = finalStatus ? 'completed' : 'cancelled';

        // If cancelled, ask for a reason
        if (newStatus === 'cancelled') {
          const reason = prompt(
            'Por favor, informe o motivo do cancelamento:\n' +
            '(Ex: Cliente desistiu, documentação incorreta, etc.)'
          );

          if (!reason || reason.trim() === '') {
            alert('É necessário informar um motivo para o cancelamento.');
            return;
          }

          // Update with cancellation reason
          await accountingApi.updateRequestStatus(requestId, newStatus, reason);
          await loadAllRequests();
          await loadRequestsByTab(activeTab);
          alert('Solicitação cancelada com sucesso.');
          return;
        }
      }

      await accountingApi.updateRequestStatus(requestId, newStatus);
      // Reload all data
      await loadAllRequests();
      await loadRequestsByTab(activeTab);

      if (newStatus === 'completed') {
        alert('✅ Solicitação marcada como concluída com sucesso!');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // Show loading while checking user role
  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // If user is not an accountant, show access denied (before redirect)
  if (!isAccountant) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
          <p className="text-sm mt-2">Apenas contadores (Parceiro: Abertura de CNPJ) e administradores podem acessar o dashboard do contador.</p>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Back Button */}
      <BackButton to="/accounting/accountant" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Solicitações de CNPJ</h1>
        <p className="text-gray-600 mt-2">Gerencie as solicitações de abertura de empresas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-yellow-200 rounded-full p-3">
              <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Ativas</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.active}</p>
            </div>
            <div className="bg-blue-200 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Concluídas</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-green-200 rounded-full p-3">
              <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Canceladas</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{stats.inactive}</p>
            </div>
            <div className="bg-red-200 rounded-full p-3">
              <svg className="w-8 h-8 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pendentes ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ativas ({stats.active})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'completed'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Concluídas ({stats.completed})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'inactive'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando solicitações...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              <p className="font-semibold">Erro:</p>
              <p>{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {request.user?.full_name || request.requestData?.full_name || 'Nome não disponível'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status]}`}>
                          {STATUS_LABELS[request.status]}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tipo:</span> {request.requestData?.preferred_company_type}
                        </div>
                        <div>
                          <span className="font-medium">Urgência:</span> {request.requestData?.urgency}
                        </div>
                        <div>
                          <span className="font-medium">Criado em:</span> {formatDate(request.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {request.requestData?.email}
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
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm whitespace-nowrap"
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
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 cursor-pointer"
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
                          className="px-3 py-2 border border-yellow-400 bg-yellow-50 rounded-md text-sm hover:bg-yellow-100 cursor-pointer font-medium"
                          defaultValue=""
                        >
                          <option value="" disabled>⚠️ Corrigir Status</option>
                          <option value="in_progress">↩️ Voltar para Em Andamento</option>
                          <option value="waiting_documents">📄 Aguardando Documentos</option>
                          <option value="processing">⚙️ Processando</option>
                          <option value="cancelled">❌ Marcar como Cancelado</option>
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
                          className="px-3 py-2 border border-red-400 bg-red-50 rounded-md text-sm hover:bg-red-100 cursor-pointer font-medium"
                          defaultValue=""
                        >
                          <option value="" disabled>🔄 Reativar Solicitação</option>
                          <option value="in_progress">↩️ Em Andamento</option>
                          <option value="waiting_documents">📄 Aguardando Documentos</option>
                          <option value="processing">⚙️ Processando</option>
                          <option value="completed">✅ Concluído</option>
                        </select>
                      )}

                      <button
                        onClick={() => navigate(`/accounting/requests/${request.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm whitespace-nowrap"
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
    </div>
  );
}
