import { useState, useEffect } from 'react';
import {
  RefreshCw, Database, Server, Activity,
  ToggleLeft, ToggleRight, Plus, Edit2, X, Trash2
} from 'lucide-react';
import { remoteJobsAdminService } from '../../../services/remoteJobsAdminService';
import { useNotification } from '../../../hooks/useNotification';

export default function RemoteJobsAdminPage() {
  const { showSuccess, showError, showInfo } = useNotification();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, companies, job-boards, scraping

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState(null);

  // Companies data
  const [companies, setCompanies] = useState([]);
  const [companiesPagination, setCompaniesPagination] = useState({});
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Job Boards data
  const [jobBoards, setJobBoards] = useState([]);
  const [jobBoardCompanies, setJobBoardCompanies] = useState([]);
  const [showJobBoardModal, setShowJobBoardModal] = useState(false);
  const [editingJobBoard, setEditingJobBoard] = useState(null);

  // Scraping data
  const [scrapingStatus, setScrapingStatus] = useState([]);
  const [scrapingHistory, setScrapingHistory] = useState([]);
  const [scraping, setScraping] = useState(false);

  // Cron config data
  const [cronConfig, setCronConfig] = useState(null);
  const [cronSuggestions, setCronSuggestions] = useState([]);
  const [updatingCron, setUpdatingCron] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'companies':
        loadCompanies();
        break;
      case 'job-boards':
        loadJobBoards();
        loadJobBoardCompanies();
        break;
      case 'scraping':
        loadScrapingStatus();
        loadScrapingHistory();
        loadCronConfig();
        break;
    }
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await remoteJobsAdminService.getDashboard();
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      showError('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async (page = 1) => {
    try {
      setLoading(true);
      const response = await remoteJobsAdminService.getAllCompanies({ page, limit: 20 });
      setCompanies(response.companies);
      setCompaniesPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Error loading companies:', error);
      showError('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const loadJobBoards = async () => {
    try {
      const response = await remoteJobsAdminService.getAllJobBoards();
      setJobBoards(response.data);
    } catch (error) {
      console.error('Error loading job boards:', error);
      showError('Erro ao carregar job boards');
    }
  };

  const loadJobBoardCompanies = async () => {
    try {
      setLoading(true);
      const response = await remoteJobsAdminService.getJobBoardCompanies();
      setJobBoardCompanies(response.data);
    } catch (error) {
      console.error('Error loading job board companies:', error);
      showError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const loadScrapingStatus = async () => {
    try {
      const response = await remoteJobsAdminService.getScrapingStatus();
      setScrapingStatus(response.data);
    } catch (error) {
      console.error('Error loading scraping status:', error);
      showError('Erro ao carregar status');
    }
  };

  const loadScrapingHistory = async () => {
    try {
      setLoading(true);
      const response = await remoteJobsAdminService.getScrapingHistory(50);
      setScrapingHistory(response.data);
    } catch (error) {
      console.error('Error loading scraping history:', error);
      showError('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const loadCronConfig = async () => {
    try {
      const response = await remoteJobsAdminService.getCronConfig();
      setCronConfig({
        expression: response.data.expression,
        description: response.data.description,
      });
      setCronSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error loading cron config:', error);
      showError('Erro ao carregar configuração do cron');
    }
  };

  const handleTriggerScraping = async (platform = null) => {
    try {
      setScraping(true);
      showInfo(platform ? `Iniciando scraping de ${platform}...` : 'Iniciando scraping de todas as plataformas...');

      const response = await remoteJobsAdminService.triggerScraping(platform);
      showSuccess(response.message || 'Scraping iniciado com sucesso');

      // Reload scraping status
      await loadScrapingStatus();
      await loadDashboard();
    } catch (error) {
      console.error('Error triggering scraping:', error);
      showError('Erro ao iniciar scraping');
    } finally {
      setScraping(false);
    }
  };

  const handleToggleJobBoardCompany = async (id) => {
    try {
      const response = await remoteJobsAdminService.toggleJobBoardCompany(id);
      showSuccess(response.message);
      await loadJobBoardCompanies();
    } catch (error) {
      console.error('Error toggling job board company:', error);
      showError('Erro ao alterar status');
    }
  };

  // Company CRUD handlers
  const handleCreateCompany = () => {
    setEditingCompany(null);
    setShowCompanyModal(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowCompanyModal(true);
  };

  const handleSaveCompany = async (companyData) => {
    try {
      if (editingCompany) {
        await remoteJobsAdminService.updateCompany(editingCompany.id, companyData);
        showSuccess('Empresa atualizada com sucesso');
      } else {
        await remoteJobsAdminService.createCompany(companyData);
        showSuccess('Empresa criada com sucesso');
      }
      setShowCompanyModal(false);
      await loadCompanies();
      await loadDashboard();
    } catch (error) {
      console.error('Error saving company:', error);
      showError('Erro ao salvar empresa');
    }
  };

  const handleDeleteCompany = async (id, name) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${name}"?`)) {
      return;
    }

    try {
      await remoteJobsAdminService.deleteCompany(id);
      showSuccess('Empresa excluída com sucesso');
      await loadCompanies();
      await loadDashboard();
    } catch (error) {
      console.error('Error deleting company:', error);
      showError('Erro ao excluir empresa');
    }
  };

  // Job Board CRUD handlers
  const handleCreateJobBoard = () => {
    setEditingJobBoard(null);
    setShowJobBoardModal(true);
  };

  const handleEditJobBoard = (jobBoard) => {
    setEditingJobBoard(jobBoard);
    setShowJobBoardModal(true);
  };

  const handleDeleteJobBoardCompany = async (id, companyName) => {
    if (!confirm(`Tem certeza que deseja excluir a configuração para "${companyName}"?`)) {
      return;
    }

    try {
      await remoteJobsAdminService.deleteJobBoardCompany(id);
      showSuccess('Configuração excluída com sucesso');
      await loadJobBoardCompanies();
      await loadDashboard();
    } catch (error) {
      console.error('Error deleting job board company:', error);
      showError('Erro ao excluir configuração');
    }
  };

  const handleUpdateCronExpression = async (expression) => {
    try {
      setUpdatingCron(true);
      const response = await remoteJobsAdminService.updateCronConfig(expression);
      showSuccess(response.message || 'Cron atualizado com sucesso');
      await loadCronConfig();
    } catch (error) {
      console.error('Error updating cron expression:', error);
      showError('Erro ao atualizar configuração do cron');
    } finally {
      setUpdatingCron(false);
    }
  };

  if (loading && !dashboardStats) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-copilot-accent-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-copilot-text-primary mb-2">
            Remote Jobs Admin
          </h1>
          <p className="text-copilot-text-secondary">
            Gerenciamento de empresas, job boards e scraping
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-copilot-border-default">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'companies', label: 'Empresas', icon: Database },
            { id: 'job-boards', label: 'Job Boards', icon: Server },
            { id: 'scraping', label: 'Scraping', icon: RefreshCw },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2
                  ${activeTab === tab.id
                    ? 'border-copilot-accent-blue text-copilot-accent-blue'
                    : 'border-transparent text-copilot-text-secondary hover:text-copilot-text-primary'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && dashboardStats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
                  <p className="text-copilot-text-secondary text-sm mb-2">Total de Empresas</p>
                  <p className="text-3xl font-bold text-copilot-text-primary">
                    {dashboardStats.companies.total}
                  </p>
                </div>

                <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
                  <p className="text-copilot-text-secondary text-sm mb-2">Job Boards</p>
                  <p className="text-3xl font-bold text-copilot-text-primary">
                    {dashboardStats.jobBoards.total}
                  </p>
                </div>

                <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
                  <p className="text-copilot-text-secondary text-sm mb-2">Configurações Ativas</p>
                  <p className="text-3xl font-bold text-copilot-accent-green">
                    {dashboardStats.jobBoardCompanies.enabled}
                  </p>
                  <p className="text-xs text-copilot-text-tertiary mt-1">
                    de {dashboardStats.jobBoardCompanies.total} total
                  </p>
                </div>

                <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
                  <p className="text-copilot-text-secondary text-sm mb-2">Total de Vagas</p>
                  <p className="text-3xl font-bold text-copilot-accent-blue">
                    {dashboardStats.scraping.totalJobs}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                  Ações Rápidas
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleTriggerScraping()}
                    disabled={scraping}
                    className="btn-copilot-primary flex items-center gap-2"
                  >
                    <RefreshCw size={18} className={scraping ? 'animate-spin' : ''} />
                    {scraping ? 'Scrapando...' : 'Scrape All'}
                  </button>

                  <button
                    onClick={loadDashboard}
                    className="btn-copilot-secondary flex items-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Atualizar
                  </button>
                </div>
              </div>

              {/* Companies by Platform */}
              {dashboardStats.companies.byPlatform && (
                <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                    Empresas por Plataforma
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(dashboardStats.companies.byPlatform).map(([platform, count]) => (
                      <div key={platform} className="text-center">
                        <p className="text-2xl font-bold text-copilot-accent-blue">{count}</p>
                        <p className="text-sm text-copilot-text-secondary capitalize">{platform}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-copilot-text-primary">
                  Empresas ({companiesPagination.total || 0})
                </h3>
                <button
                  onClick={handleCreateCompany}
                  className="btn-copilot-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Nova Empresa
                </button>
              </div>

              {companies.length === 0 ? (
                <p className="text-copilot-text-secondary text-center py-8">
                  Nenhuma empresa cadastrada
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-copilot-border-default">
                        <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Nome</th>
                        <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Plataforma</th>
                        <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Slug</th>
                        <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Featured</th>
                        <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Total Jobs</th>
                        <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company) => (
                        <tr key={company.id} className="border-b border-copilot-border-default hover:bg-copilot-bg-tertiary">
                          <td className="py-3 px-4 text-copilot-text-primary">{company.name}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded text-xs bg-copilot-accent-blue bg-opacity-10 text-copilot-accent-blue">
                              {company.platform}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-copilot-text-secondary text-sm">{company.slug}</td>
                          <td className="py-3 px-4">
                            {company.featured ? (
                              <span className="text-copilot-accent-green">✓</span>
                            ) : (
                              <span className="text-copilot-text-tertiary">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-copilot-text-primary">{company.totalJobs || 0}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCompany(company)}
                                className="p-2 hover:bg-copilot-bg-primary rounded"
                                title="Editar"
                              >
                                <Edit2 size={16} className="text-copilot-accent-blue" />
                              </button>
                              <button
                                onClick={() => handleDeleteCompany(company.id, company.name)}
                                className="p-2 hover:bg-copilot-bg-primary rounded"
                                title="Excluir"
                              >
                                <Trash2 size={16} className="text-copilot-accent-red" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Job Boards Tab */}
          {activeTab === 'job-boards' && (
            <div className="space-y-6">
              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                  Configurações de Empresas ({jobBoardCompanies.length})
                </h3>

                {jobBoardCompanies.length === 0 ? (
                  <p className="text-copilot-text-secondary text-center py-8">
                    Nenhuma configuração encontrada
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-copilot-border-default">
                          <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Job Board</th>
                          <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Empresa</th>
                          <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Último Scrape</th>
                          <th className="text-left py-3 px-4 text-copilot-text-secondary font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobBoardCompanies.slice(0, 50).map((jbc) => (
                          <tr key={jbc.id} className="border-b border-copilot-border-default hover:bg-copilot-bg-tertiary">
                            <td className="py-3 px-4 text-copilot-text-primary">{jbc.jobBoard?.name}</td>
                            <td className="py-3 px-4 text-copilot-text-primary">{jbc.company?.name}</td>
                            <td className="py-3 px-4">
                              {jbc.enabled ? (
                                <span className="px-2 py-1 rounded text-xs bg-copilot-accent-green bg-opacity-10 text-copilot-accent-green">
                                  Ativo
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded text-xs bg-copilot-text-tertiary bg-opacity-10 text-copilot-text-tertiary">
                                  Inativo
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-copilot-text-secondary text-sm">
                              {jbc.lastScrapedAt
                                ? new Date(jbc.lastScrapedAt).toLocaleString('pt-BR')
                                : 'Nunca'
                              }
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleToggleJobBoardCompany(jbc.id)}
                                  className="p-2 hover:bg-copilot-bg-primary rounded"
                                  title={jbc.enabled ? 'Desativar' : 'Ativar'}
                                >
                                  {jbc.enabled ? (
                                    <ToggleRight size={20} className="text-copilot-accent-green" />
                                  ) : (
                                    <ToggleLeft size={20} className="text-copilot-text-tertiary" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteJobBoardCompany(jbc.id, jbc.company?.name)}
                                  className="p-2 hover:bg-copilot-bg-primary rounded"
                                  title="Excluir"
                                >
                                  <Trash2 size={16} className="text-copilot-accent-red" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scraping Tab */}
          {activeTab === 'scraping' && (
            <div className="space-y-6">
              {/* Cron Configuration */}
              {cronConfig && (
                <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                    Configuração do Agendamento
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-copilot-bg-tertiary border border-copilot-border-default rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-copilot-text-secondary">Expressão Cron Atual:</span>
                        <span className="font-mono text-copilot-accent-blue">{cronConfig.expression}</span>
                      </div>
                      <p className="text-sm text-copilot-text-secondary">
                        {cronConfig.description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                        Selecione um intervalo predefinido:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {cronSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.expression}
                            onClick={() => handleUpdateCronExpression(suggestion.expression)}
                            disabled={updatingCron || cronConfig.expression === suggestion.expression}
                            className={`
                              px-4 py-3 rounded-lg border text-left transition-colors
                              ${cronConfig.expression === suggestion.expression
                                ? 'border-copilot-accent-blue bg-copilot-accent-blue bg-opacity-10 text-copilot-accent-blue'
                                : 'border-copilot-border-default bg-copilot-bg-tertiary text-copilot-text-primary hover:border-copilot-accent-blue'
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                          >
                            <div className="font-medium text-sm">{suggestion.description}</div>
                            <div className="font-mono text-xs text-copilot-text-tertiary mt-1">
                              {suggestion.expression}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {updatingCron && (
                      <div className="flex items-center gap-2 text-copilot-accent-blue">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-copilot-accent-blue border-t-transparent"></div>
                        <span className="text-sm">Atualizando configuração...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                  Status por Plataforma
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scrapingStatus.map((status) => (
                    <div key={status.slug} className="bg-copilot-bg-tertiary border border-copilot-border-default rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-copilot-text-primary">{status.jobBoard}</h4>
                        <button
                          onClick={() => handleTriggerScraping(status.slug)}
                          disabled={scraping}
                          className="p-1 hover:bg-copilot-bg-secondary rounded"
                          title="Executar scraping"
                        >
                          <RefreshCw size={16} className={`${scraping ? 'animate-spin' : ''} text-copilot-accent-blue`} />
                        </button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-copilot-text-secondary">Empresas:</span>
                          <span className="text-copilot-text-primary">
                            {status.enabledCompanies}/{status.totalCompanies}
                          </span>
                        </div>

                        {status.lastScraped && (
                          <div className="flex justify-between">
                            <span className="text-copilot-text-secondary">Último:</span>
                            <span className="text-copilot-text-primary text-xs">
                              {new Date(status.lastScraped).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        )}

                        {status.lastStatus && (
                          <div className="flex justify-between">
                            <span className="text-copilot-text-secondary">Status:</span>
                            <span className={`
                              px-2 py-0.5 rounded text-xs
                              ${status.lastStatus === 'success'
                                ? 'bg-copilot-accent-green bg-opacity-10 text-copilot-accent-green'
                                : 'bg-copilot-accent-red bg-opacity-10 text-copilot-accent-red'
                              }
                            `}>
                              {status.lastStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Company Modal */}
        {showCompanyModal && (
          <CompanyModal
            company={editingCompany}
            onSave={handleSaveCompany}
            onClose={() => setShowCompanyModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Company Modal Component
function CompanyModal({ company, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    slug: company?.slug || '',
    platform: company?.platform || 'greenhouse',
    careersUrl: company?.careersUrl || '',
    featured: company?.featured || false,
    logoUrl: company?.logoUrl || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-copilot-text-primary">
              {company ? 'Editar Empresa' : 'Nova Empresa'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-copilot-bg-tertiary rounded"
            >
              <X size={20} className="text-copilot-text-secondary" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary"
                required
              />
              <p className="text-xs text-copilot-text-tertiary mt-1">
                URL-friendly identifier (ex: google, microsoft)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                Plataforma *
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary"
                required
              >
                <option value="greenhouse">Greenhouse</option>
                <option value="lever">Lever</option>
                <option value="workable">Workable</option>
                <option value="ashby">Ashby</option>
                <option value="wellfound">Wellfound</option>
                <option value="builtin">BuiltIn</option>
                <option value="weworkremotely">WeWorkRemotely</option>
                <option value="remotive">Remotive</option>
                <option value="remoteyeah">RemoteYeah</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                URL de Carreiras
              </label>
              <input
                type="url"
                value={formData.careersUrl}
                onChange={(e) => setFormData({ ...formData, careersUrl: e.target.value })}
                className="w-full px-4 py-2 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                URL do Logo
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-4 py-2 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="featured" className="text-sm text-copilot-text-primary">
                Empresa em destaque
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="btn-copilot-primary flex-1"
              >
                {company ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-copilot-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
