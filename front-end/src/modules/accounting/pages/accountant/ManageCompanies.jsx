import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../../services/accountingApi';
import { useUserStatus } from '../../../../hooks/useUserStatus';
import BackButton from '../../../../components/BackButton';

const COMPANY_STATUS_LABELS = {
  active: 'Ativa',
  inactive: 'Inativa',
  suspended: 'Suspensa',
};

const COMPANY_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

export default function ManageCompanies() {
  const navigate = useNavigate();
  const { userStatus } = useUserStatus();
  const [cpf, setCpf] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Check if user is accountant
  const isAccountant = userStatus?.role === 'partner_cnpj' || userStatus?.role === 'admin';

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!cpf.trim()) {
      setError('Por favor, informe um CPF');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearched(true);

      const data = await accountingApi.getCompaniesByCpf(cpf);
      setCompanies(data);
    } catch (err) {
      console.error('Error searching companies:', err);

      // Provide user-friendly error messages
      let errorMessage = 'Erro ao buscar empresas';

      if (err.message?.includes('Cannot GET') || err.message?.includes('404')) {
        errorMessage = 'Não foram encontradas empresas para este CPF. Verifique se o CPF está correto ou se a empresa já foi cadastrada no sistema.';
      } else if (err.message?.includes('Network') || err.message?.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.';
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
      } else if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
        errorMessage = 'Você não tem permissão para acessar esta funcionalidade.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde ou contate o suporte.';
      }

      setError(errorMessage);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setCpf('');
    setCompanies([]);
    setSearched(false);
    setError(null);
  };

  const formatCpf = (value) => {
    // Remove non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Apply CPF mask: 000.000.000-00
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    return numbers.slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfChange = (e) => {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
  };

  const formatCnpj = (cnpj) => {
    if (!cnpj) return '';
    // Format: 00.000.000/0000-00
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleUploadTaxes = (companyId) => {
    navigate(`/accounting/accountant/upload-taxes/${companyId}`);
  };

  if (!isAccountant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">
            Apenas contadores têm acesso a esta página.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar para Home
          </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Empresas</h1>
          <p className="text-gray-600 mt-2">
            Busque empresas por CPF do proprietário para fazer upload de impostos
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                CPF do Proprietário
              </label>
              <input
                type="text"
                id="cpf"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
              {searched && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Limpar
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {searched && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {companies.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma empresa encontrada</h3>
                <p className="mt-1 text-gray-500">
                  Não existem empresas cadastradas para o CPF informado.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {companies.length} {companies.length === 1 ? 'Empresa Encontrada' : 'Empresas Encontradas'}
                </h2>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {company.legalName}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                COMPANY_STATUS_COLORS[company.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {COMPANY_STATUS_LABELS[company.status] || company.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">CNPJ:</span>{' '}
                              {formatCnpj(company.cnpj)}
                            </div>
                            <div>
                              <span className="font-medium">Proprietário:</span>{' '}
                              {company.user?.name || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Contador:</span>{' '}
                              {company.accountant?.name || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Criada em:</span>{' '}
                              {formatDate(company.createdAt)}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUploadTaxes(company.id)}
                          className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          Upload de Impostos
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
