import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../services/accountingApi';
import RequestTimeline from '../components/RequestTimeline';
import BackButton from '../../../components/BackButton';

/**
 * AccountingHome Page
 *
 * Main dashboard for accounting module.
 * Shows different states based on user situation:
 *
 * 1. No company + No request → CTA to request CNPJ opening
 * 2. No company + Has request → Show request timeline/status
 * 3. Has company → Redirect to company dashboard
 *
 * Flow:
 * - Load user's requests
 * - Check if user has company (future: check companies API)
 * - Render appropriate UI based on state
 */
export default function AccountingHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user's requests and companies
      const [userRequests, userCompanies] = await Promise.all([
        accountingApi.getMyRequests(),
        accountingApi.getMyCompanies().catch(() => []), // Fallback to empty array if endpoint doesn't exist yet
      ]);

      setRequests(userRequests || []);
      setCompanies(userCompanies || []);

      // Find active request (not completed or cancelled)
      const active = userRequests?.find(
        req => req.status !== 'completed' && req.status !== 'cancelled'
      );
      setActiveRequest(active || null);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto"></div>
          <p className="mt-4 text-copilot-text-secondary">Carregando...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded">
          <p className="font-semibold">Erro ao carregar dados</p>
          <p>{error}</p>
        </div>
        <button
          onClick={loadUserData}
          className="btn-copilot-primary mt-4"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // STATE 1: No request → Show CTA to request CNPJ
  if (!activeRequest) {
    return (
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <BackButton to="/home" />
        {/* My Companies Section */}
        {companies.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">Minhas Empresas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map(company => (
                <div
                  key={company.id}
                  className="card-copilot p-6 cursor-pointer transition"
                  onClick={() => navigate(`/accounting/company/${company.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-copilot-accent-primary/20 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-copilot-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      company.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-copilot-bg-tertiary text-copilot-text-secondary'
                    }`}>
                      {company.status === 'active' ? 'Ativa' : company.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-copilot-text-primary mb-2">{company.legalName}</h3>
                  <p className="text-sm text-copilot-text-secondary mb-1">CNPJ: {company.cnpj}</p>
                  <p className="text-sm text-copilot-text-tertiary">
                    {company.companyType} • {company.taxRegime?.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center py-12">
          <div className="inline-block bg-copilot-accent-primary/20 p-6 rounded-full mb-6">
            <svg className="w-16 h-16 text-copilot-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-copilot-text-primary mb-4">
            {companies.length > 0 ? 'Abrir Nova Empresa' : 'Abertura de CNPJ'}
          </h1>

          <p className="text-copilot-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            {companies.length > 0
              ? 'Deseja abrir mais uma empresa com a ajuda de nossos contadores parceiros?'
              : 'Ainda não identificamos nenhuma solicitação de abertura de empresa. Deseja abrir um CNPJ com a ajuda de nossos contadores parceiros?'
            }
          </p>

          <button
            onClick={() => navigate('/accounting/request-cnpj')}
            className="btn-copilot-primary px-8 py-3 text-lg font-semibold shadow-lg"
          >
            Solicitar Abertura de CNPJ
          </button>

          {/* Previous completed/cancelled requests */}
          {requests.length > 0 && (
            <div className="mt-12 pt-8 border-t border-copilot-border-default">
              <h3 className="text-xl font-semibold text-copilot-text-primary mb-4">
                Solicitações Anteriores
              </h3>
              <div className="space-y-3">
                {requests.map(req => (
                  <div
                    key={req.id}
                    className="card-copilot p-4 text-left cursor-pointer transition"
                    onClick={() => navigate(`/accounting/requests/${req.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-copilot-text-primary">
                          Solicitação #{req.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-copilot-text-secondary">
                          {req.requestData.business_type} - {req.requestData.preferred_company_type}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        req.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-copilot-bg-tertiary text-copilot-text-secondary'
                      }`}>
                        {req.status === 'completed' ? 'Concluída' : 'Cancelada'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STATE 2: Has active request → Show timeline
  return (
    <div className="max-w-6xl mx-auto p-6 relative z-10">
      <BackButton to="/home" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-copilot-text-primary">
          Abertura de CNPJ em Andamento
        </h1>
        <p className="text-copilot-text-secondary mt-2">
          Acompanhe o status da sua solicitação de abertura de empresa
        </p>
      </div>

      {/* Request Timeline */}
      <RequestTimeline request={activeRequest} />

      {/* Request Details Card */}
      <div className="mt-8 card-copilot p-6">
        <h2 className="text-xl font-semibold text-copilot-text-primary mb-4">
          Detalhes da Solicitação
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-copilot-text-tertiary">Tipo de Empresa:</p>
            <p className="font-medium text-copilot-text-primary">{activeRequest.requestData.preferred_company_type}</p>
          </div>
          <div>
            <p className="text-copilot-text-tertiary">Tipo de Negócio:</p>
            <p className="font-medium text-copilot-text-primary">{activeRequest.requestData.business_type}</p>
          </div>
          <div>
            <p className="text-copilot-text-tertiary">Faturamento Estimado:</p>
            <p className="font-medium text-copilot-text-primary">{activeRequest.requestData.estimated_revenue}</p>
          </div>
          <div>
            <p className="text-copilot-text-tertiary">Urgência:</p>
            <p className="font-medium text-copilot-text-primary capitalize">{activeRequest.requestData.urgency}</p>
          </div>
          <div>
            <p className="text-copilot-text-tertiary">Solicitado em:</p>
            <p className="font-medium text-copilot-text-primary">
              {new Date(activeRequest.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {activeRequest.assignedTo && (
            <div>
              <p className="text-copilot-text-tertiary">Contador Responsável:</p>
              <p className="font-medium text-copilot-text-primary">{activeRequest.assignedTo.full_name}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/accounting/requests/${activeRequest.id}`)}
            className="btn-copilot-primary"
          >
            Ver Todos os Detalhes
          </button>
        </div>
      </div>

      {/* What to expect section */}
      <div className="mt-8 bg-copilot-accent-primary/10 border border-copilot-accent-primary/30 rounded p-6">
        <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
          Próximos Passos
        </h3>
        <ul className="space-y-2 text-copilot-text-secondary">
          {activeRequest.status === 'pending' && (
            <>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Um contador será atribuído à sua solicitação em breve</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Você receberá uma notificação quando isso acontecer</span>
              </li>
            </>
          )}
          {activeRequest.status === 'in_progress' && (
            <>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>O contador entrará em contato para solicitar documentos</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Tenha em mãos: RG, CPF, comprovante de residência</span>
              </li>
            </>
          )}
          {activeRequest.status === 'waiting_documents' && (
            <>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Envie os documentos solicitados pelo contador</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Após envio, o processo de abertura será iniciado</span>
              </li>
            </>
          )}
          {activeRequest.status === 'processing' && (
            <>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Seu CNPJ está sendo processado na Receita Federal</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Este processo pode levar alguns dias úteis</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
