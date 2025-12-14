import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { accountingApi } from '../../../services/accountingApi';
import { useUserStatus } from '../../../hooks/useUserStatus';
import { useNotification } from '../../../hooks/useNotification';
import { getErrorMessage, ERROR_CONTEXTS } from '../../../utils/errorHandler';
import BackButton from '../../../components/BackButton';

/**
 * CompanyDashboard
 *
 * Dashboard for users to view and manage their company.
 * Features:
 * - Company information (legal name, CNPJ, status, etc.)
 * - Company documents
 *
 * Access: Only company owner can view
 */
export default function CompanyDashboard() {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userStatus, loading: userLoading } = useUserStatus();
  const { showSuccess, showError, showWarning, showConfirmation } = useNotification();

  // Get initial tab from URL parameter (e.g., ?tab=chat)
  const initialTab = searchParams.get('tab') || 'summary';
  const [activeTab, setActiveTab] = useState(initialTab); // summary, taxes, documents, chat
  const [company, setCompany] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [taxObligations, setTaxObligations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tax filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingTaxes, setLoadingTaxes] = useState(false);

  // Check if user is accountant (partner_cnpj or admin)
  const isAccountant = !userLoading && (userStatus?.role === 'partner_cnpj' || userStatus?.role === 'admin');

  // Document upload state
  const [selectedCategory, setSelectedCategory] = useState('constituicao');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDocType, setUploadDocType] = useState('');
  const [uploadExpirationDate, setUploadExpirationDate] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [expiringDocuments, setExpiringDocuments] = useState([]);

  // Load company details
  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyData = await accountingApi.getCompanyById(companyId);
      setCompany(companyData);
    } catch (err) {
      console.error('Error loading company:', err);
      setError(getErrorMessage(err, ERROR_CONTEXTS.LOAD_COMPANIES));
    } finally {
      setLoading(false);
    }
  };

  // Load documents when tab changes to documents
  useEffect(() => {
    if (activeTab === 'documents' && companyId) {
      loadDocuments();
    }
  }, [activeTab, companyId]);

  // Load tax obligations when tab changes to taxes OR when filters change
  useEffect(() => {
    if (activeTab === 'taxes' && companyId) {
      loadTaxObligations(selectedMonth, selectedYear);
    }
  }, [activeTab, companyId, selectedMonth, selectedYear]);

  const loadDocuments = async () => {
    try {
      const docs = await accountingApi.getCompanyDocuments(companyId);
      setDocuments(docs);

      // Also load expiring documents
      const expiring = await accountingApi.getExpiringDocuments(companyId);
      setExpiringDocuments(expiring);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showWarning('Arquivo muito grande. Tamanho máximo: 10MB.');
      e.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showWarning('Tipo de arquivo não permitido. Use PDF, JPG ou PNG.');
      e.target.value = '';
      return;
    }

    setUploadFile(file);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();

    if (!uploadFile) {
      showWarning('Por favor, selecione um arquivo.');
      return;
    }

    if (!uploadDocType.trim()) {
      showWarning('Por favor, informe o tipo do documento.');
      return;
    }

    try {
      setUploading(true);

      await accountingApi.uploadCompanyDocument(
        companyId,
        uploadFile,
        selectedCategory,
        uploadDocType,
        uploadExpirationDate || null,
        uploadNotes || null
      );

      // Reset form
      setUploadFile(null);
      setUploadDocType('');
      setUploadExpirationDate('');
      setUploadNotes('');
      document.querySelector('input[type="file"]').value = '';

      // Reload documents
      await loadDocuments();

      showSuccess('Documento enviado com sucesso!');
    } catch (err) {
      console.error('Error uploading document:', err);
      showError(getErrorMessage(err, ERROR_CONTEXTS.UPLOAD_DOCUMENT));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    showConfirmation(
      'Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await accountingApi.deleteCompanyDocument(documentId);
          await loadDocuments();
          showSuccess('Documento deletado com sucesso!');
        } catch (err) {
          console.error('Error deleting document:', err);
          showError(getErrorMessage(err, ERROR_CONTEXTS.DELETE_DOCUMENT));
        }
      }
    );
  };

  const handleViewDocument = async (documentId) => {
    try {
      const { filePath } = await accountingApi.getCompanyDocumentDownloadUrl(documentId);
      // Open file in new tab for viewing
      window.open(`http://localhost:3000/${filePath}`, '_blank');
    } catch (err) {
      console.error('Error viewing document:', err);
      showError(getErrorMessage(err, ERROR_CONTEXTS.DOWNLOAD_DOCUMENT));
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const { filePath } = await accountingApi.getCompanyDocumentDownloadUrl(documentId);

      // Fetch the file and create a blob to force download
      const response = await fetch(`http://localhost:3000/${filePath}`);
      const blob = await response.blob();

      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      showError(getErrorMessage(err, ERROR_CONTEXTS.DOWNLOAD_DOCUMENT));
    }
  };

  const loadTaxObligations = async (month, year) => {
    try {
      setLoadingTaxes(true);
      const taxes = await accountingApi.getCompanyTaxObligations(companyId, month, year);
      setTaxObligations(taxes);
    } catch (err) {
      console.error('Error loading tax obligations:', err);
      setTaxObligations([]);
    } finally {
      setLoadingTaxes(false);
    }
  };

  // Quick navigation functions
  const handlePreviousMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear = newYear - 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
  };

  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear = newYear + 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const getMonthName = (month) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const handleMarkAsPaid = async (taxId) => {
    showConfirmation(
      'Deseja marcar este imposto como pago?',
      async () => {
        try {
          await accountingApi.confirmTaxPayment(taxId, {
            paidAmount: null,
            paymentConfirmation: `Pago em ${new Date().toLocaleDateString('pt-BR')}`,
          });
          // Reload tax obligations with current filters
          await loadTaxObligations(selectedMonth, selectedYear);
          showSuccess('Imposto marcado como pago com sucesso!');
        } catch (err) {
          console.error('Error marking as paid:', err);
          showError(getErrorMessage(err, ERROR_CONTEXTS.PAY_TAX));
        }
      }
    );
  };

  const handleDownloadTaxPdf = async (taxId, fileName) => {
    try {
      const blob = await accountingApi.downloadTaxPdf(taxId);

      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading tax PDF:', err);
      showError(getErrorMessage(err, ERROR_CONTEXTS.DOWNLOAD_DOCUMENT));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return 'N/A';
    // Format: 00.000.000/0000-00
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Ativa', className: 'bg-green-500/20 text-green-400' },
      inactive: { label: 'Inativa', className: 'bg-gray-500/20 text-gray-400' },
      suspended: { label: 'Suspensa', className: 'bg-red-500/20 text-red-400' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-500/20 text-gray-400' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent mx-auto"></div>
          <p className="mt-4 text-copilot-text-secondary">Carregando empresa...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Erro</h2>
          <p>{error || 'Empresa não encontrada'}</p>
          <button
            onClick={() => navigate('/accounting')}
            className="mt-4 btn-copilot-primary"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // Determine back URL based on user role
  const backUrl = isAccountant ? '/accounting/accountant/companies' : '/accounting';

  return (
    <div className="max-w-7xl mx-auto p-6 relative z-10">
      {/* Back Button */}
      <BackButton to={backUrl} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-copilot-text-primary">{company.tradeName || company.legalName}</h1>
            <p className="text-copilot-text-secondary text-sm mt-1">{formatCNPJ(company.cnpj)}</p>
          </div>
          {getStatusBadge(company.status)}
        </div>
      </div>

      {/* Tabs */}
      <div className="card-copilot">
        <div className="border-b border-slate-600">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'summary'
                  ? 'border-copilot-accent text-copilot-accent'
                  : 'border-transparent text-copilot-text-secondary hover:text-copilot-text-primary hover:border-copilot-border-hover'
              }`}
            >
              Resumo
            </button>
            <button
              onClick={() => setActiveTab('taxes')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'taxes'
                  ? 'border-copilot-accent text-copilot-accent'
                  : 'border-transparent text-copilot-text-secondary hover:text-copilot-text-primary hover:border-copilot-border-hover'
              }`}
            >
              Impostos
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                activeTab === 'documents'
                  ? 'border-copilot-accent text-copilot-accent'
                  : 'border-transparent text-copilot-text-secondary hover:text-copilot-text-primary hover:border-copilot-border-hover'
              }`}
            >
              Documentos
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">Informações Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-secondary mb-1">Razão Social</label>
                    <p className="text-copilot-text-primary">{company.legalName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-copilot-text-secondary mb-1">Nome Fantasia</label>
                    <p className="text-copilot-text-primary">{company.tradeName || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-copilot-text-secondary mb-1">CNPJ</label>
                    <p className="text-copilot-text-primary font-mono">{formatCNPJ(company.cnpj)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-copilot-text-secondary mb-1">Tipo de Empresa</label>
                    <p className="text-copilot-text-primary">{company.companyType}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-copilot-text-secondary mb-1">Regime Tributário</label>
                    <p className="text-copilot-text-primary">{company.taxRegime}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-copilot-text-secondary mb-1">Data de Abertura</label>
                    <p className="text-copilot-text-primary">{formatDate(company.openingDate)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-copilot-text-secondary mb-1">Atividade Principal (CNAE)</label>
                    <p className="text-copilot-text-primary">{company.mainActivity}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-copilot-text-secondary mb-1">Faturamento Estimado</label>
                    <p className="text-copilot-text-primary">
                      R$ {company.estimatedRevenue ? company.estimatedRevenue.toLocaleString('pt-BR') : 'N/A'}
                    </p>
                  </div>

                  {company.stateRegistration && (
                    <div>
                      <label className="block text-sm font-medium text-copilot-text-secondary mb-1">Inscrição Estadual</label>
                      <p className="text-copilot-text-primary">{company.stateRegistration}</p>
                    </div>
                  )}

                  {company.municipalRegistration && (
                    <div>
                      <label className="block text-sm font-medium text-copilot-text-secondary mb-1">Inscrição Municipal</label>
                      <p className="text-copilot-text-primary">{company.municipalRegistration}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {company.address && (
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">Endereço</h3>
                  <div className="bg-copilot-bg-tertiary p-4 rounded-lg border border-copilot-border-default">
                    <p className="text-copilot-text-primary">
                      {company.address.street}, {company.address.number}
                      {company.address.complement && `, ${company.address.complement}`}
                    </p>
                    <p className="text-copilot-text-primary">
                      {company.address.neighborhood} - {company.address.city}/{company.address.state}
                    </p>
                    <p className="text-copilot-text-primary">CEP: {company.address.zip_code}</p>
                  </div>
                </div>
              )}

              {/* Accountant Info */}
              {company.accountant && (
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">Contador Responsável</h3>
                  <div className="bg-copilot-accent/10 p-4 rounded-lg flex items-center gap-4 border border-copilot-accent/20">
                    <div className="w-12 h-12 bg-copilot-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-copilot-accent font-bold text-lg">
                        {company.accountant.full_name?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-copilot-text-primary">{company.accountant.full_name}</p>
                      <p className="text-sm text-copilot-text-secondary">{company.accountant.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Taxes Tab */}
          {activeTab === 'taxes' && (
            <div>
              {/* Period Navigation - Clean Design */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                {/* Current Period Display */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-copilot-accent/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-copilot-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-copilot-text-primary">
                      {getMonthName(selectedMonth)} {selectedYear}
                    </h3>
                    <p className="text-sm text-copilot-text-tertiary">
                      {taxObligations.length} {taxObligations.length === 1 ? 'imposto' : 'impostos'}
                    </p>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                  {/* Previous */}
                  <button
                    onClick={handlePreviousMonth}
                    className="p-2 text-copilot-text-secondary bg-copilot-bg-tertiary hover:bg-copilot-bg-secondary rounded-lg transition border border-copilot-border-default"
                    title="Mês Anterior"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Month/Year Selectors */}
                  <div className="flex items-center bg-copilot-bg-tertiary rounded-lg p-1 border border-copilot-border-default">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="bg-transparent px-2 py-1.5 text-sm font-medium text-copilot-text-primary focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                    <span className="text-copilot-border-default">|</span>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="bg-transparent px-2 py-1.5 text-sm font-medium text-copilot-text-primary focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Next */}
                  <button
                    onClick={handleNextMonth}
                    className="p-2 text-copilot-text-secondary bg-copilot-bg-tertiary hover:bg-copilot-bg-secondary rounded-lg transition border border-copilot-border-default"
                    title="Próximo Mês"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Today Button */}
                  <button
                    onClick={handleCurrentMonth}
                    className="ml-1 btn-copilot-primary text-sm py-1.5"
                  >
                    Hoje
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loadingTaxes ? (
                <div className="text-center py-12 bg-copilot-bg-tertiary border border-copilot-border-default rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent mx-auto mb-4"></div>
                  <p className="text-copilot-text-secondary">Carregando impostos...</p>
                </div>
              ) : taxObligations.length === 0 ? (
                <div className="text-center py-12 bg-copilot-bg-tertiary border border-copilot-border-default rounded-lg">
                  <svg className="w-16 h-16 mx-auto text-copilot-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                    />
                  </svg>
                  <p className="text-copilot-text-secondary">Nenhum imposto cadastrado para {getMonthName(selectedMonth)}/{selectedYear}</p>
                  <p className="text-sm text-copilot-text-tertiary mt-2">
                    Seu contador irá gerar as guias de impostos mensalmente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {taxObligations.map((tax) => {
                    const isOverdue = new Date(tax.dueDate) < new Date() && tax.status === 'pending';
                    const isDueSoon =
                      new Date(tax.dueDate) - new Date() < 7 * 24 * 60 * 60 * 1000 && tax.status === 'pending';

                    const statusConfig = {
                      pending: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400' },
                      paid: { label: 'Pago', className: 'bg-green-500/20 text-green-400' },
                      overdue: { label: 'Vencido', className: 'bg-red-500/20 text-red-400' },
                      cancelled: { label: 'Cancelado', className: 'bg-gray-500/20 text-gray-400' },
                    };

                    const status = isOverdue ? 'overdue' : tax.status;
                    const config = statusConfig[status] || statusConfig.pending;

                    return (
                      <div
                        key={tax.id}
                        className={`bg-copilot-bg-tertiary border rounded-lg p-6 ${isOverdue ? 'border-red-500/50' : isDueSoon ? 'border-yellow-500/50' : 'border-copilot-border-default'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-copilot-text-primary">
                                {tax.taxType} - {new Date(tax.referencePeriod).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
                                {config.label}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-copilot-text-secondary">
                              <div>
                                <span className="font-medium text-copilot-text-primary">Vencimento:</span>{' '}
                                <span className={isOverdue ? 'text-red-400 font-semibold' : isDueSoon ? 'text-yellow-400 font-semibold' : ''}>
                                  {formatDate(tax.dueDate)}
                                </span>
                                {isDueSoon && !isOverdue && (
                                  <span className="ml-2 text-yellow-400 text-xs">Vence em breve</span>
                                )}
                                {isOverdue && <span className="ml-2 text-red-400 text-xs">Vencido</span>}
                              </div>
                              <div>
                                <span className="font-medium text-copilot-text-primary">Valor:</span>{' '}
                                <span className="text-lg font-bold text-copilot-text-primary">
                                  R$ {tax.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              {tax.barcode && (
                                <div className="col-span-2">
                                  <span className="font-medium text-copilot-text-primary">Código de Barras:</span>{' '}
                                  <span className="font-mono text-xs">{tax.barcode}</span>
                                </div>
                              )}
                              {tax.status === 'paid' && tax.paidAt && (
                                <div className="col-span-2">
                                  <span className="font-medium text-copilot-text-primary">Pago em:</span> {formatDate(tax.paidAt)}
                                  {tax.paidAmount && tax.paidAmount !== tax.amount && (
                                    <span className="ml-2">
                                      (Valor pago: R$ {tax.paidAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="ml-4 flex flex-col gap-2">
                            {tax.filePath && (
                              <button
                                onClick={() => handleDownloadTaxPdf(tax.id, tax.fileName || `${tax.taxType}-${tax.referenceMonth}-${tax.referenceYear}.pdf`)}
                                className="px-4 py-2 text-sm bg-copilot-bg-secondary text-copilot-text-primary border border-copilot-border-default rounded hover:bg-copilot-bg-tertiary whitespace-nowrap transition"
                              >
                                Download PDF
                              </button>
                            )}
                            {tax.status === 'pending' && (
                              <button
                                onClick={() => {
                                  if (window.confirm('Tem certeza que deseja marcar este imposto como pago?')) {
                                    handleMarkAsPaid(tax.id);
                                  }
                                }}
                                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap transition"
                              >
                                Marcar como Pago
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-6">Documentos da Empresa</h3>

              {/* Expiring Documents Alert */}
              {expiringDocuments.length > 0 && (
                <div className="mb-6 bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-yellow-300 mb-2">Documentos Vencendo</h4>
                      <ul className="text-sm text-yellow-200 space-y-1">
                        {expiringDocuments.map((doc) => (
                          <li key={doc.id}>
                            • <strong>{doc.documentType}</strong> - Vence em{' '}
                            {new Date(doc.expirationDate).toLocaleDateString('pt-BR')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Form */}
              <div className="bg-copilot-bg-tertiary border border-copilot-border-default rounded-lg p-6 mb-6">
                <h4 className="text-md font-semibold text-copilot-text-primary mb-4">Upload de Documento</h4>
                <form onSubmit={handleUploadDocument} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                        Categoria <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-copilot w-full"
                        required
                      >
                        <option value="constituicao">Constituição</option>
                        <option value="registros">Registros</option>
                        <option value="certidoes">Certidões</option>
                        <option value="fiscais">Fiscais</option>
                        <option value="outros">Outros</option>
                      </select>
                      <p className="mt-1 text-xs text-copilot-text-tertiary">
                        {selectedCategory === 'constituicao' && 'Contrato Social, Alterações'}
                        {selectedCategory === 'registros' && 'Cartão CNPJ, Alvarás, Certificado MEI'}
                        {selectedCategory === 'certidoes' && 'Certidões Negativas (Federal, Estadual, Municipal)'}
                        {selectedCategory === 'fiscais' && 'Guias Pagas, Declarações'}
                        {selectedCategory === 'outros' && 'Documentos diversos'}
                      </p>
                    </div>

                    {/* Document Type */}
                    <div>
                      <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                        Tipo do Documento <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={uploadDocType}
                        onChange={(e) => setUploadDocType(e.target.value)}
                        placeholder="Ex: Contrato Social, Cartão CNPJ"
                        className="input-copilot w-full"
                        required
                      />
                    </div>

                    {/* File */}
                    <div>
                      <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                        Arquivo <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full px-4 py-2 border border-copilot-border-default rounded-lg bg-copilot-bg-secondary text-copilot-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-600 file:text-white file:cursor-pointer hover:file:bg-slate-500"
                        required
                      />
                      {uploadFile && (
                        <p className="mt-1 text-xs text-green-400">
                          {uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>

                    {/* Expiration Date (optional for certidões) */}
                    <div>
                      <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                        Data de Vencimento (Opcional)
                      </label>
                      <input
                        type="date"
                        value={uploadExpirationDate}
                        onChange={(e) => setUploadExpirationDate(e.target.value)}
                        className="input-copilot w-full"
                      />
                      <p className="mt-1 text-xs text-copilot-text-tertiary">
                        Para certidões e documentos com validade
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                      Observações (Opcional)
                    </label>
                    <textarea
                      value={uploadNotes}
                      onChange={(e) => setUploadNotes(e.target.value)}
                      rows={2}
                      maxLength={500}
                      placeholder="Informações adicionais sobre o documento..."
                      className="input-copilot w-full"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="btn-copilot-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Enviando...' : 'Enviar Documento'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Category Tabs */}
              <div className="border-b border-copilot-border-default mb-4">
                <div className="flex space-x-4">
                  {['constituicao', 'registros', 'certidoes', 'fiscais', 'outros'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      title={
                        cat === 'constituicao' ? 'Contrato Social, Alterações Contratuais, Estatuto Social' :
                        cat === 'registros' ? 'Cartão CNPJ, Alvarás, Certificado MEI, Inscrição Estadual' :
                        cat === 'certidoes' ? 'Certidões Negativas (Federal, Estadual, Municipal, FGTS)' :
                        cat === 'fiscais' ? 'Guias Pagas, Declarações, Recibos de Impostos' :
                        'Documentos diversos que não se encaixam nas outras categorias'
                      }
                      className={`py-2 px-4 text-sm font-medium border-b-2 transition ${
                        selectedCategory === cat
                          ? 'border-copilot-accent text-copilot-accent'
                          : 'border-transparent text-copilot-text-secondary hover:text-copilot-text-primary'
                      }`}
                    >
                      {cat === 'constituicao' && 'Constituição'}
                      {cat === 'registros' && 'Registros'}
                      {cat === 'certidoes' && 'Certidões'}
                      {cat === 'fiscais' && 'Fiscais'}
                      {cat === 'outros' && 'Outros'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Documents List */}
              {documents.filter((doc) => doc.category === selectedCategory).length === 0 ? (
                <div className="text-center py-12 bg-copilot-bg-tertiary border border-copilot-border-default rounded-lg">
                  <svg className="w-16 h-16 mx-auto text-copilot-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-copilot-text-secondary">Nenhum documento nesta categoria</p>
                  <p className="text-sm text-copilot-text-tertiary mt-2">
                    Use o formulário acima para fazer upload
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.filter((doc) => doc.category === selectedCategory)
                    .map((doc) => {
                      const hasExpiration = doc.expirationDate !== null;
                      const isExpired = hasExpiration && new Date(doc.expirationDate) < new Date();
                      const isExpiringSoon = hasExpiration && !isExpired &&
                        Math.ceil((new Date(doc.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 30;

                      return (
                        <div
                          key={doc.id}
                          className={`bg-copilot-bg-tertiary border rounded-lg p-4 hover:border-copilot-border-hover transition cursor-pointer ${
                            isExpired ? 'border-red-500/50' : isExpiringSoon ? 'border-yellow-500/50' : 'border-copilot-border-default'
                          }`}
                          onClick={() => handleViewDocument(doc.id)}
                          title="Clique para visualizar o documento"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="text-2xl mt-1">
                                {doc.mimeType === 'application/pdf' ? '📄' : '🖼️'}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-copilot-text-primary">{doc.documentType}</p>
                                <p className="text-sm text-copilot-text-secondary">{doc.fileName}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-copilot-text-tertiary">
                                  <span>
                                    {(doc.fileSize / 1024).toFixed(2) < 1024
                                      ? `${(doc.fileSize / 1024).toFixed(2)} KB`
                                      : `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Enviado em {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                                  </span>
                                  {hasExpiration && (
                                    <>
                                      <span>•</span>
                                      <span className={isExpired ? 'text-red-400 font-semibold' : isExpiringSoon ? 'text-yellow-400 font-semibold' : ''}>
                                        {isExpired ? 'Vencido em ' : 'Vence em '}
                                        {new Date(doc.expirationDate).toLocaleDateString('pt-BR')}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {doc.notes && (
                                  <p className="mt-2 text-sm text-copilot-text-secondary italic">
                                    {doc.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                                className="px-3 py-1.5 text-sm bg-copilot-bg-secondary text-copilot-text-primary border border-copilot-border-default rounded hover:bg-copilot-bg-tertiary transition"
                                title="Baixar documento"
                              >
                                Download
                              </button>
                              {/* Show delete button only if user is uploader OR accountant */}
                              {(doc.uploadedById === localStorage.getItem('userId') || isAccountant) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Tem certeza que deseja deletar "${doc.fileName}"?`)) {
                                      handleDeleteDocument(doc.id);
                                    }
                                  }}
                                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                  title="Deletar"
                                >
                                  Excluir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
