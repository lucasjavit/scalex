import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../services/accountingApi';
import { useUserStatus } from '../../../hooks/useUserStatus';
import DocumentUpload from '../components/DocumentUpload';
import CompanyForm from '../components/CompanyForm';
import BackButton from '../../../components/BackButton';

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
  const { userStatus, loading: userLoading } = useUserStatus();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // info, documents, register

  // Check if user is accountant (partner_cnpj or admin)
  const isAccountant = !userLoading && (userStatus?.role === 'partner_cnpj' || userStatus?.role === 'admin');

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

  const handleCompanyCreated = async (company) => {
    alert('Empresa criada com sucesso! A solicitação foi marcada como concluída.');
    setShowCompanyForm(false);
    await loadRequest();
    navigate(`/accounting/companies/${company.id}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-6xl mx-auto p-6">
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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header com botão voltar */}
      <BackButton to={isAccountant ? '/accounting/accountant/dashboard' : '/accounting/my-requests'} />

      {/* Card principal com header e abas */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Detalhes da Solicitação</h1>
              <div className="mt-2 space-y-1">
                <p className="text-blue-100">
                  <span className="font-semibold">Proprietário:</span> {request.requestData.full_name}
                </p>
                <p className="text-blue-100">
                  <span className="font-semibold">CPF:</span> {request.requestData.cpf}
                </p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-blue-800">
              {STATUS_LABELS[request.status]}
            </span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Informações
            </button>

            {request.company && (
              <button
                onClick={() => setActiveTab('company')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  activeTab === 'company'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏢 Empresa
              </button>
            )}

            {request.status !== 'cancelled' && (
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📄 Documentos
              </button>
            )}

            {isAccountant &&
              request.assignedToId &&
              request.status !== 'cancelled' &&
              request.status !== 'completed' &&
              request.status !== 'pending' && (
                <button
                  onClick={() => setActiveTab('register')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                    activeTab === 'register'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ✅ Registrar Empresa
                </button>
              )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Aba: Informações */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Dados Pessoais */}
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Dados da Empresa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
              <section>
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
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Informações Adicionais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
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
          )}

          {/* Aba: Empresa */}
          {activeTab === 'company' && request.company && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Dados da Empresa Registrada</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  request.company.status === 'active' ? 'bg-green-100 text-green-800' :
                  request.company.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.company.status === 'active' ? 'Ativa' :
                   request.company.status === 'inactive' ? 'Inativa' : 'Suspensa'}
                </span>
              </div>

              {/* Informações Básicas */}
              <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium">Razão Social:</p>
                    <p className="text-blue-900 font-semibold">{request.company.legalName}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">CNPJ:</p>
                    <p className="text-blue-900 font-semibold">{request.company.cnpj}</p>
                  </div>
                  {request.company.tradeName && (
                    <div>
                      <p className="text-blue-700 font-medium">Nome Fantasia:</p>
                      <p className="text-blue-900 font-semibold">{request.company.tradeName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-blue-700 font-medium">Tipo de Empresa:</p>
                    <p className="text-blue-900 font-semibold">{request.company.companyType}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Regime Tributário:</p>
                    <p className="text-blue-900 font-semibold">{request.company.taxRegime}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Data de Abertura:</p>
                    <p className="text-blue-900 font-semibold">
                      {new Date(request.company.openingDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Atividade e Faturamento */}
              <section className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Atividade e Faturamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-700 font-medium">Atividade Principal:</p>
                    <p className="text-green-900 font-semibold">{request.company.mainActivity}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">Faturamento Estimado:</p>
                    <p className="text-green-900 font-semibold">
                      R$ {parseFloat(request.company.estimatedRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </section>

              {/* Endereço */}
              <section className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">Endereço</h3>
                <div className="text-sm">
                  <p className="text-purple-900 font-medium">
                    {request.company.address.street}, {request.company.address.number}
                    {request.company.address.complement && ` - ${request.company.address.complement}`}
                  </p>
                  <p className="text-purple-900 font-medium">
                    {request.company.address.neighborhood}, {request.company.address.city} - {request.company.address.state}
                  </p>
                  <p className="text-purple-900 font-medium">
                    CEP: {request.company.address.zipCode}
                  </p>
                </div>
              </section>

              {/* Inscrições */}
              {(request.company.stateRegistration || request.company.municipalRegistration) && (
                <section className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4">Inscrições</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {request.company.stateRegistration && (
                      <div>
                        <p className="text-orange-700 font-medium">Inscrição Estadual:</p>
                        <p className="text-orange-900 font-semibold">{request.company.stateRegistration}</p>
                      </div>
                    )}
                    {request.company.municipalRegistration && (
                      <div>
                        <p className="text-orange-700 font-medium">Inscrição Municipal:</p>
                        <p className="text-orange-900 font-semibold">{request.company.municipalRegistration}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Datas de Registro */}
              <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-700 font-medium">Registrado em:</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(request.company.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Última atualização:</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(request.company.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Botão para ir ao painel da empresa */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={() => navigate(`/accounting/companies/${request.company.id}`)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Ir para Painel da Empresa
                </button>
              </div>
            </div>
          )}

          {/* Aba: Documentos */}
          {activeTab === 'documents' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Documentos</h2>
              <p className="text-gray-600 mb-6">
                {request.status === 'completed'
                  ? 'Documentos relacionados à abertura do CNPJ. Você pode visualizar, adicionar ou remover documentos.'
                  : 'Envie os documentos solicitados pelo contador para agilizar o processo de abertura do CNPJ.'}
              </p>
              <DocumentUpload
                requestId={request.id}
                currentUserId={localStorage.getItem('userId')}
                isAccountant={isAccountant}
              />
            </div>
          )}

          {/* Aba: Registrar Empresa (apenas para contadores) */}
          {activeTab === 'register' && isAccountant && (
            <div>
              {!showCompanyForm ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <svg
                        className="w-6 h-6 text-green-600 mr-3 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                          Processo de CNPJ Concluído?
                        </h3>
                        <p className="text-green-800 mb-4">
                          Se você já finalizou a abertura do CNPJ, registre a empresa no sistema para
                          concluir a solicitação.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCompanyForm(true)}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Registrar Empresa
                  </button>
                </div>
              ) : (
                <CompanyForm
                  requestId={request.id}
                  request={request}
                  onSuccess={handleCompanyCreated}
                  onCancel={() => setShowCompanyForm(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
