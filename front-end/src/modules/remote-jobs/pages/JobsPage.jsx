import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, Bookmark } from 'lucide-react';
import JobCard from '../components/JobCard';
import { jobsService } from '../../../services/jobsService';
import { useNotification } from '../../../hooks/useNotification';

const SENIORITY_OPTIONS = [
  { value: '', label: 'Todos os níveis' },
  { value: 'intern', label: 'Estágio' },
  { value: 'junior', label: 'Júnior' },
  { value: 'mid', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'staff', label: 'Staff' },
  { value: 'principal', label: 'Principal' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'full-time', label: 'Tempo integral' },
  { value: 'part-time', label: 'Meio período' },
  { value: 'contract', label: 'Contrato' },
  { value: 'internship', label: 'Estágio' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'Todos', icon: '🌍' },
  { value: 'greenhouse', label: 'Greenhouse', icon: '🏢' },
  { value: 'lever', label: 'Lever', icon: '⚙️' },
  { value: 'workable', label: 'Workable', icon: '🏗️' },
  { value: 'ashby', label: 'Ashby', icon: '🏛️' },
  { value: 'wellfound', label: 'Wellfound', icon: '🌐' },
  { value: 'builtin', label: 'Built In', icon: '🏙️' },
  { value: 'weworkremotely', label: 'We Work Remotely', icon: '💼' },
  { value: 'remotive', label: 'Remotive', icon: '🚀' },
  { value: 'remoteyeah', label: 'RemoteYeah', icon: '🌟' },
];

export default function JobsPage() {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedSource, setSelectedSource] = useState('all'); // 'all', 'greenhouse', 'lever'

  // Filters
  const [filters, setFilters] = useState({
    platform: '', // Será definido baseado no selectedSource
    remote: true,
    seniority: '',
    employmentType: '',
    page: 1,
    limit: 20,
  });

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);

    // Load jobs
    loadJobs();
  }, []);

  useEffect(() => {
    // Reload jobs when filters change
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsService.getAllJobs(filters);

      if (response) {
        setJobs(response.jobs || []);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          limit: response.limit || 20,
          totalPages: response.totalPages || 0,
        });
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      showError('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    try {
      setScraping(true);
      showInfo(`Iniciando busca de novas vagas (${SOURCE_OPTIONS.find(s => s.value === selectedSource)?.label})...`);

      let response;

      // Chama o método apropriado baseado na fonte selecionada
      if (selectedSource === 'greenhouse') {
        response = await jobsService.triggerGreenhouseScraping();
      } else if (selectedSource === 'lever') {
        response = await jobsService.triggerLeverScraping();
      } else if (selectedSource === 'workable') {
        response = await jobsService.triggerWorkableScraping();
      } else if (selectedSource === 'ashby') {
        response = await jobsService.triggerAshbyScraping();
      } else if (selectedSource === 'wellfound') {
        response = await jobsService.triggerWellfoundScraping();
      } else if (selectedSource === 'builtin') {
        response = await jobsService.triggerBuiltInScraping();
      } else if (selectedSource === 'weworkremotely') {
        response = await jobsService.triggerWeWorkRemotelyScraping();
      } else if (selectedSource === 'remotive') {
        response = await jobsService.triggerRemotiveScraping();
      } else if (selectedSource === 'remoteyeah') {
        response = await jobsService.triggerRemoteYeahScraping();
      } else {
        // 'all' - scrape tudo
        response = await jobsService.triggerScraping();
      }

      if (response && response.data) {
        const total = response.data.total || 0;
        const companies = response.data.companies || 0;

        showSuccess(
          selectedSource === 'all'
            ? `Busca concluída! ${total} vagas encontradas`
            : `Busca concluída! ${total} vagas de ${companies} empresas`
        );

        // Reload jobs
        await loadJobs();
      }
    } catch (error) {
      console.error('Error scraping jobs:', error);
      showError('Erro ao buscar vagas. Tente novamente.');
    } finally {
      setScraping(false);
    }
  };

  const handleSourceChange = (source) => {
    setSelectedSource(source);

    // Atualiza o filtro de platform baseado na fonte
    setFilters(prev => ({
      ...prev,
      platform: source === 'all' ? '' : source,
      page: 1, // Reset to first page
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-copilot-accent-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Carregando vagas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search className="text-copilot-accent-blue" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-copilot-text-primary">Vagas Remotas</h1>
                <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-medium bg-copilot-accent-purple bg-opacity-10 text-copilot-accent-purple">
                  {SOURCE_OPTIONS.find(s => s.value === selectedSource)?.icon} {SOURCE_OPTIONS.find(s => s.value === selectedSource)?.label}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Saved Jobs Button */}
              <button
                onClick={() => navigate('/jobs/saved')}
                className="btn-copilot-secondary flex items-center gap-2"
              >
                <Bookmark size={18} />
                Vagas Salvas
              </button>

              {/* Scrape Button */}
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="btn-copilot-primary flex items-center gap-2"
              >
                <RefreshCw size={18} className={scraping ? 'animate-spin' : ''} />
                {scraping ? 'Buscando...' : 'Atualizar Vagas'}
              </button>
            </div>
          </div>
          <p className="text-copilot-text-secondary mb-4">
            {selectedSource === 'all' && 'Todas as vagas remotas de Greenhouse, Lever, Workable e agregadores'}
            {selectedSource === 'greenhouse' && 'Vagas remotas de 45+ empresas que usam Greenhouse: GitLab, Coinbase, Airbnb, Stripe e mais'}
            {selectedSource === 'lever' && 'Vagas remotas de 45+ empresas que usam Lever: Netflix, Uber, Reddit, MongoDB e mais'}
            {selectedSource === 'workable' && 'Vagas remotas de 30+ empresas que usam Workable: Revolut, Coursera, Zendesk, Farfetch e mais'}
          </p>

          {/* Source Selector */}
          <div className="flex gap-3">
            {SOURCE_OPTIONS.map((source) => (
              <button
                key={source.value}
                onClick={() => handleSourceChange(source.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${selectedSource === source.value
                    ? 'bg-copilot-accent-blue text-white shadow-lg'
                    : 'bg-copilot-bg-secondary text-copilot-text-secondary border border-copilot-border-default hover:border-copilot-accent-blue'
                  }
                `}
              >
                <span className="mr-2">{source.icon}</span>
                {source.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-copilot-text-secondary" />
            <h2 className="text-lg font-semibold text-copilot-text-primary">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Remote Only */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) => handleFilterChange('remote', e.target.checked)}
                  className="w-4 h-4 rounded border-copilot-border-default bg-copilot-bg-tertiary checked:bg-copilot-accent-blue"
                />
                <span className="text-sm text-copilot-text-secondary">Apenas vagas remotas</span>
              </label>
            </div>

            {/* Seniority */}
            <div>
              <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                Nível de Senioridade
              </label>
              <select
                value={filters.seniority}
                onChange={(e) => handleFilterChange('seniority', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-copilot-bg-tertiary border border-copilot-border-default text-copilot-text-primary focus:border-copilot-accent-blue focus:ring-1 focus:ring-copilot-accent-blue"
              >
                {SENIORITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                Tipo de Contratação
              </label>
              <select
                value={filters.employmentType}
                onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-copilot-bg-tertiary border border-copilot-border-default text-copilot-text-primary focus:border-copilot-accent-blue focus:ring-1 focus:ring-copilot-accent-blue"
              >
                {EMPLOYMENT_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-copilot-text-secondary">
            {pagination.total} vagas encontradas
            {pagination.total > pagination.limit && ` (página ${pagination.page} de ${pagination.totalPages})`}
          </p>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-12 text-center">
            <Search className="mx-auto mb-4 text-copilot-text-tertiary" size={48} />
            <p className="text-copilot-text-secondary text-lg mb-2">Nenhuma vaga encontrada</p>
            <p className="text-copilot-text-tertiary mb-4">
              Tente ajustar os filtros ou busque novas vagas
            </p>
            <button
              onClick={handleScrape}
              disabled={scraping}
              className="btn-copilot-primary"
            >
              <RefreshCw size={18} className={scraping ? 'animate-spin mr-2' : 'mr-2'} />
              {scraping ? 'Buscando...' : 'Buscar Vagas'}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {jobs.map((job, index) => (
                <JobCard
                  key={`${job.externalId}-${job.platform}-${index}`}
                  job={job}
                  userId={userId}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg bg-copilot-bg-secondary border border-copilot-border-default text-copilot-text-secondary hover:bg-copilot-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg border ${
                        pagination.page === pageNum
                          ? 'bg-copilot-accent-blue text-white border-copilot-accent-blue'
                          : 'bg-copilot-bg-secondary border-copilot-border-default text-copilot-text-secondary hover:bg-copilot-bg-tertiary'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg bg-copilot-bg-secondary border border-copilot-border-default text-copilot-text-secondary hover:bg-copilot-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
