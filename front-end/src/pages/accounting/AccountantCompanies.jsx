import React, { useState, useEffect } from 'react';
import { accountingApi } from '../../services/accountingApi';
import TaxObligationsList from '../../components/accounting/TaxObligationsList';
import TaxObligationForm from '../../components/accounting/TaxObligationForm';

/**
 * AccountantCompanies Page
 *
 * Displays all companies managed by the authenticated accountant.
 * Accountants can view companies and generate tax obligations.
 *
 * Features:
 * - List all accountant's companies
 * - Filter companies by status
 * - View and generate tax obligations for each company
 * - Expandable company cards with detailed information
 * - Tax obligation management within each company card
 */
const AccountantCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [showTaxForm, setShowTaxForm] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, [statusFilter]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountingApi.getAccountantCompanies(statusFilter);
      setCompanies(data);
    } catch (err) {
      console.error('Error loading companies:', err);
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };

    const labels = {
      active: 'Ativa',
      inactive: 'Inativa',
      suspended: 'Suspensa',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTaxRegimeLabel = (regime) => {
    const labels = {
      SIMPLES_NACIONAL: 'Simples Nacional',
      LUCRO_PRESUMIDO: 'Lucro Presumido',
      LUCRO_REAL: 'Lucro Real',
    };
    return labels[regime] || regime;
  };

  const handleTaxCreated = () => {
    setShowTaxForm(null);
    // Reload to refresh tax list
    loadCompanies();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Empresas dos Clientes</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as empresas dos seus clientes e suas obrigações fiscais
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-2 rounded-md ${
              statusFilter === null
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-md ${
              statusFilter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Ativas
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-md ${
              statusFilter === 'inactive'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Inativas
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Companies list */}
        {companies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">
              {statusFilter
                ? `Nenhuma empresa ${statusFilter === 'active' ? 'ativa' : 'inativa'} encontrada.`
                : 'Você ainda não possui empresas de clientes cadastradas.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Company header - Always visible */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedCompany(expandedCompany === company.id ? null : company.id)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {company.legalName}
                        </h3>
                        {getStatusBadge(company.status)}
                      </div>
                      {company.tradeName && company.tradeName !== company.legalName && (
                        <p className="text-sm text-gray-600 mb-1">
                          Nome Fantasia: {company.tradeName}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        CNPJ: {formatCNPJ(company.cnpj)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Regime: {getTaxRegimeLabel(company.taxRegime)}
                      </p>
                      {company.user && (
                        <p className="text-sm text-gray-600 mt-1">
                          Cliente: {company.user.name || company.user.email}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <button className="text-blue-600 hover:text-blue-800">
                        {expandedCompany === company.id ? '▼ Ocultar' : '▶ Ver Detalhes'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Company details - Expandable */}
                {expandedCompany === company.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {/* Company Information */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Informações da Empresa
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Atividade Principal:</span>
                          <p className="text-gray-900">{company.mainActivity}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Data de Abertura:</span>
                          <p className="text-gray-900">
                            {new Date(company.openingDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Faturamento Estimado:</span>
                          <p className="text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(company.estimatedRevenue)}
                          </p>
                        </div>
                        {company.stateRegistration && (
                          <div>
                            <span className="text-gray-600">Inscrição Estadual:</span>
                            <p className="text-gray-900">{company.stateRegistration}</p>
                          </div>
                        )}
                        {company.municipalRegistration && (
                          <div>
                            <span className="text-gray-600">Inscrição Municipal:</span>
                            <p className="text-gray-900">{company.municipalRegistration}</p>
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      {company.address && (
                        <div className="mt-4">
                          <span className="text-gray-600 text-sm">Endereço:</span>
                          <p className="text-gray-900 text-sm">
                            {company.address.street}, {company.address.number}
                            {company.address.complement && ` - ${company.address.complement}`}
                            <br />
                            {company.address.neighborhood} - {company.address.city}/{company.address.state}
                            <br />
                            CEP: {company.address.zipCode}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tax Obligation Form */}
                    {showTaxForm === company.id ? (
                      <div className="mb-6">
                        <TaxObligationForm
                          companyId={company.id}
                          onSuccess={handleTaxCreated}
                          onCancel={() => setShowTaxForm(null)}
                        />
                      </div>
                    ) : (
                      <div className="mb-6">
                        <button
                          onClick={() => setShowTaxForm(company.id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          + Gerar Nova Obrigação Fiscal
                        </button>
                      </div>
                    )}

                    {/* Tax Obligations Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <TaxObligationsList companyId={company.id} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantCompanies;
