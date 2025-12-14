import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../services/accountingApi';
import { getErrorMessage, ERROR_CONTEXTS } from '../../../utils/errorHandler';
import BackButton from '../../../components/BackButton';

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
  waiting_documents: 'bg-orange-500/20 text-orange-400',
  processing: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await accountingApi.getMyRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Erro ao carregar solicitações:', err);
      setError(getErrorMessage(err, ERROR_CONTEXTS.LOAD_REQUESTS));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto"></div>
          <p className="mt-4 text-copilot-text-secondary">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded">
          <p className="font-semibold">Erro ao carregar solicitações:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 relative z-10">
      <BackButton to="/accounting" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-copilot-text-primary">Minhas Solicitações</h1>
        <button
          onClick={() => navigate('/accounting/request-cnpj')}
          className="btn-copilot-primary"
        >
          + Nova Solicitação
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="card-copilot p-12 text-center">
          <svg className="w-16 h-16 text-copilot-text-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">Nenhuma solicitação encontrada</h3>
          <p className="text-copilot-text-secondary mb-4">Você ainda não fez nenhuma solicitação de abertura de CNPJ.</p>
          <button
            onClick={() => navigate('/accounting/request-cnpj')}
            className="btn-copilot-primary"
          >
            Fazer Primeira Solicitação
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="card-copilot p-6 cursor-pointer transition"
              onClick={() => navigate(`/accounting/requests/${request.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary">
                    {request.requestData?.full_name || 'Solicitação sem nome'}
                  </h3>
                  <p className="text-sm text-copilot-text-secondary">
                    {request.requestData?.business_type || 'Tipo de negócio não especificado'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[request.status]}`}>
                  {STATUS_LABELS[request.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="font-medium text-copilot-text-tertiary">Tipo de Empresa:</p>
                  <p className="text-copilot-text-primary">{request.requestData?.preferred_company_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-copilot-text-tertiary">Faturamento:</p>
                  <p className="text-copilot-text-primary">{request.requestData?.estimated_revenue || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-copilot-text-tertiary">Criado em:</p>
                  <p className="text-copilot-text-primary">{new Date(request.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="font-medium text-copilot-text-tertiary">Contador:</p>
                  <p className="text-copilot-text-primary">{request.assignedTo?.full_name || 'Não atribuído'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
