import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../../services/accountingApi';
import { useUserStatus } from '../../../../hooks/useUserStatus';
import { getErrorMessage, ERROR_CONTEXTS } from '../../../../utils/errorHandler';
import BackButton from '../../../../components/BackButton';

const COMPANY_STATUS_LABELS = {
  active: 'Ativa',
  inactive: 'Inativa',
  suspended: 'Suspensa',
};

const COMPANY_STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  suspended: 'bg-red-500/20 text-red-400',
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
      setError(getErrorMessage(err, ERROR_CONTEXTS.SEARCH_COMPANIES));
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
      <div className="bg-copilot-bg-primary min-h-screen">
        <main className="max-w-6xl mx-auto px-6 py-12 flex items-center justify-center min-h-screen">
          <div className="card-copilot p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-4">Acesso Restrito</h2>
            <p className="text-copilot-text-secondary mb-6">
              Apenas contadores têm acesso a esta página.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="btn-copilot-primary"
            >
              Voltar para Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Button */}
        <BackButton to="/accounting/accountant" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-copilot-text-primary">Gerenciar Empresas</h1>
          <p className="text-copilot-text-secondary mt-2">
            Busque empresas por CPF do proprietário para fazer upload de impostos
          </p>
        </div>

        {/* Search Form */}
        <div className="card-copilot p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="cpf" className="block text-sm font-medium text-copilot-text-secondary mb-2">
                CPF do Proprietário
              </label>
              <input
                type="text"
                id="cpf"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="input-copilot w-full"
                disabled={loading}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-copilot-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
              {searched && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="btn-copilot-secondary"
                >
                  Limpar
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {searched && !loading && (
          <div className="card-copilot p-6">
            {companies.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-copilot-text-tertiary"
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
                <h3 className="mt-2 text-lg font-medium text-copilot-text-primary">Nenhuma empresa encontrada</h3>
                <p className="mt-1 text-copilot-text-secondary">
                  Não existem empresas cadastradas para o CPF informado.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-copilot-text-primary mb-4">
                  {companies.length} {companies.length === 1 ? 'Empresa Encontrada' : 'Empresas Encontradas'}
                </h2>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="border border-copilot-border-default rounded-lg p-4 hover:border-copilot-border-hover transition-colors bg-copilot-bg-tertiary"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-copilot-text-primary">
                              {company.legalName}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                COMPANY_STATUS_COLORS[company.status] || 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {COMPANY_STATUS_LABELS[company.status] || company.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-copilot-text-secondary">
                            <div>
                              <span className="font-medium text-copilot-text-primary">CNPJ:</span>{' '}
                              {formatCnpj(company.cnpj)}
                            </div>
                            <div>
                              <span className="font-medium text-copilot-text-primary">Proprietário:</span>{' '}
                              {company.user?.name || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium text-copilot-text-primary">Contador:</span>{' '}
                              {company.accountant?.name || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium text-copilot-text-primary">Criada em:</span>{' '}
                              {formatDate(company.createdAt)}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUploadTaxes(company.id)}
                          className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
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
      </main>
    </div>
  );
}
