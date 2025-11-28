import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../services/accountingApi';
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
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_documents: 'bg-orange-100 text-orange-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Erro ao carregar solicitações:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <BackButton to="/accounting" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Minhas Solicitações</h1>
        <button
          onClick={() => navigate('/accounting/request-cnpj')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          + Nova Solicitação
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma solicitação encontrada</h3>
          <p className="text-gray-600 mb-4">Você ainda não fez nenhuma solicitação de abertura de CNPJ.</p>
          <button
            onClick={() => navigate('/accounting/request-cnpj')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Fazer Primeira Solicitação
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/accounting/requests/${request.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {request.requestData?.full_name || 'Solicitação sem nome'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {request.requestData?.business_type || 'Tipo de negócio não especificado'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[request.status]}`}>
                  {STATUS_LABELS[request.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Tipo de Empresa:</p>
                  <p>{request.requestData?.preferred_company_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Faturamento:</p>
                  <p>{request.requestData?.estimated_revenue || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Criado em:</p>
                  <p>{new Date(request.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="font-medium">Contador:</p>
                  <p>{request.assignedTo?.full_name || 'Não atribuído'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
