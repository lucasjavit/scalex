import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../services/accountingApi';
import ChatBox from '../components/ChatBox';

const STATUS_LABELS = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  waiting_documents: 'Aguardando Documentos',
  processing: 'Processando',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await accountingApi.getRequestById(id);
      setRequest(data);
    } catch (err) {
      console.error('Erro ao carregar solicitação:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar esta solicitação?')) {
      return;
    }

    try {
      setCanceling(true);
      await accountingApi.cancelRequest(id, 'Cancelado pelo usuário');
      await loadRequest();
      alert('Solicitação cancelada com sucesso!');
    } catch (err) {
      console.error('Erro ao cancelar:', err);
      alert('Erro ao cancelar solicitação: ' + err.message);
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Erro:</p>
          <p>{error || 'Solicitação não encontrada'}</p>
        </div>
        <button onClick={() => navigate('/accounting/my-requests')} className="mt-4 text-blue-600 hover:underline">
          Voltar para Minhas Solicitações
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate('/accounting/my-requests')} className="mb-4 text-blue-600 hover:underline flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Detalhes da Solicitação</h1>
            <p className="text-gray-600 mt-1">ID: {request.id}</p>
          </div>
          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
            {STATUS_LABELS[request.status]}
          </span>
        </div>

        {/* Dados Pessoais */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Dados Pessoais</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Nome:</p>
              <p className="font-medium">{request.requestData.full_name}</p>
            </div>
            <div>
              <p className="text-gray-600">CPF:</p>
              <p className="font-medium">{request.requestData.cpf}</p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{request.requestData.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Telefone:</p>
              <p className="font-medium">{request.requestData.phone}</p>
            </div>
          </div>
        </section>

        {/* Dados da Empresa */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Dados da Empresa</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Tipo de Negócio:</p>
              <p className="font-medium">{request.requestData.business_type}</p>
            </div>
            <div>
              <p className="text-gray-600">Tipo de Empresa:</p>
              <p className="font-medium">{request.requestData.preferred_company_type}</p>
            </div>
            <div>
              <p className="text-gray-600">Faturamento Estimado:</p>
              <p className="font-medium">{request.requestData.estimated_revenue}</p>
            </div>
            <div>
              <p className="text-gray-600">Urgência:</p>
              <p className="font-medium capitalize">{request.requestData.urgency}</p>
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Endereço</h2>
          <p className="text-sm">
            {request.requestData.address.street}, {request.requestData.address.number}
            {request.requestData.address.complement && ` - ${request.requestData.address.complement}`}
            <br />
            {request.requestData.address.neighborhood}, {request.requestData.address.city} - {request.requestData.address.state}
            <br />
            CEP: {request.requestData.address.zip_code}
          </p>
        </section>

        {/* Informações Adicionais */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Informações Adicionais</h2>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-600">Criado em:</p>
              <p className="font-medium">{new Date(request.createdAt).toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-gray-600">Última atualização:</p>
              <p className="font-medium">{new Date(request.updatedAt).toLocaleString('pt-BR')}</p>
            </div>
            {request.assignedTo && (
              <div>
                <p className="text-gray-600">Contador atribuído:</p>
                <p className="font-medium">{request.assignedTo.full_name}</p>
              </div>
            )}
          </div>
          {request.requestData.notes && (
            <div>
              <p className="text-gray-600 mb-1">Observações:</p>
              <p className="font-medium bg-gray-50 p-3 rounded">{request.requestData.notes}</p>
            </div>
          )}
        </section>

        {/* Ações */}
        {request.status !== 'cancelled' && request.status !== 'completed' && (
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400"
            >
              {canceling ? 'Cancelando...' : 'Cancelar Solicitação'}
            </button>
          </div>
        )}
      </div>

      {/* Chat Section - Only show if accountant is assigned */}
      {request.assignedToId && (
        <div className="mt-8 bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Chat com o Contador
          </h2>
          <p className="text-gray-600 mb-6">
            Converse diretamente com {request.assignedTo?.full_name || 'seu contador'} sobre sua solicitação.
          </p>

          <ChatBox
            requestId={request.id}
            receiverId={request.assignedToId}
            currentUserId={localStorage.getItem('userId')}
          />
        </div>
      )}

      {/* Info box when no accountant assigned yet */}
      {!request.assignedToId && request.status === 'pending' && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Aguardando atribuição de contador
              </h3>
              <p className="text-blue-800">
                Em breve um contador será atribuído à sua solicitação e você poderá conversar diretamente com ele através do chat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
