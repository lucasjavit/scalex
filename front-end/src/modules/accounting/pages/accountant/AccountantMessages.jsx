import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../../services/accountingApi';
import { useUserStatus } from '../../../../hooks/useUserStatus';
import BackButton from '../../../../components/BackButton';

/**
 * AccountantMessages
 *
 * Page for accountants to view all companies with chat messages.
 * Shows a list of companies with:
 * - Last message preview
 * - Unread message count
 * - Company details
 * - Click to open chat on CompanyDashboard
 *
 * Access: Only accountants (partner_cnpj or admin)
 */
export default function AccountantMessages() {
  const navigate = useNavigate();
  const { userStatus, loading: userLoading } = useUserStatus();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is accountant
  const isAccountant = userStatus?.role === 'partner_cnpj' || userStatus?.role === 'admin';

  // Redirect if not accountant
  useEffect(() => {
    if (!userLoading && !isAccountant) {
      navigate('/home');
    }
  }, [userLoading, isAccountant, navigate]);

  // Load companies with messages
  useEffect(() => {
    if (isAccountant) {
      loadCompanies();
    }
  }, [isAccountant]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountingApi.getAccountantCompaniesWithMessages();
      setCompanies(data);
    } catch (err) {
      console.error('Error loading companies with messages:', err);
      setError('Erro ao carregar empresas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCompanyClick = (companyId) => {
    // Navigate to company dashboard and open chat tab
    navigate(`/accounting/company/${companyId}?tab=chat`);
  };

  // Filter companies by search term
  const filteredCompanies = companies.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.company.legalName?.toLowerCase().includes(searchLower) ||
      item.company.tradeName?.toLowerCase().includes(searchLower) ||
      item.company.cnpj?.includes(searchTerm) ||
      item.company.owner?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  // Show loading while checking user role
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // If not accountant, show access denied
  if (!isAccountant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p>Apenas contadores podem acessar esta página.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <BackButton to="/accounting/accountant" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chat com Clientes</h1>
          <p className="text-gray-600 mt-2">
            Visualize e responda mensagens dos clientes
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por empresa, CNPJ ou proprietário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando conversas...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
            <h3 className="font-semibold mb-2">Erro</h3>
            <p>{error}</p>
            <button
              onClick={loadCompanies}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Tentar Novamente
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma mensagem ainda'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Tente buscar com outros termos.'
                : 'Quando os clientes enviarem mensagens, elas aparecerão aqui.'}
            </p>
          </div>
        ) : (
          /* Companies List */
          <div className="space-y-4">
            {filteredCompanies.map((item) => (
              <div
                key={item.company.id}
                onClick={() => handleCompanyClick(item.company.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-400 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {item.company.tradeName || item.company.legalName}
                        </h3>
                        {item.unreadCount > 0 && (
                          <span className="flex-shrink-0 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {item.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{formatCNPJ(item.company.cnpj)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{item.company.owner.full_name}</span>
                        </div>
                      </div>

                      {/* Last Message Preview */}
                      {item.lastMessage && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-700">
                              {item.lastMessage.isFromAccountant ? 'Você' : item.lastMessage.senderName}:
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(item.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.lastMessage.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Arrow Icon */}
                    <div className="ml-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && !error && companies.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-semibold">{filteredCompanies.length}</span> {filteredCompanies.length === 1 ? 'empresa' : 'empresas'}
                {searchTerm && ` (${companies.length} total)`}
              </div>
              <div>
                <span className="font-semibold">
                  {companies.reduce((sum, item) => sum + item.unreadCount, 0)}
                </span> mensagens não lidas
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
