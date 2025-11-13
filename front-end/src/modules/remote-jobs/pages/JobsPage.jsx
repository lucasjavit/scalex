import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, Bookmark, X, ArrowUp } from 'lucide-react';
import JobCard from '../components/JobCard';
import MultiSelect from '../../../components/MultiSelect';
import BackButton from '../../../components/BackButton';
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
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];

const JOB_CATEGORIES = [
  { value: '', label: 'Todas as categorias' },
  { value: 'android developer', label: 'Android Developer' },
  { value: 'artificial intelligence engineer', label: 'AI Engineer' },
  { value: 'back-end engineer', label: 'Back-end Engineer' },
  { value: 'blockchain developer', label: 'Blockchain Developer' },
  { value: 'data analyst', label: 'Data Analyst' },
  { value: 'data engineer', label: 'Data Engineer' },
  { value: 'data scientist', label: 'Data Scientist' },
  { value: 'devops engineer', label: 'DevOps Engineer' },
  { value: 'front-end engineer', label: 'Front-end Engineer' },
  { value: 'full-stack engineer', label: 'Full-stack Engineer' },
  { value: 'ios developer', label: 'iOS Developer' },
  { value: 'machine learning engineer', label: 'Machine Learning Engineer' },
  { value: 'mobile developer', label: 'Mobile Developer' },
  { value: 'product designer', label: 'Product Designer' },
  { value: 'product manager', label: 'Product Manager' },
  { value: 'qa engineer', label: 'QA Engineer' },
  { value: 'security engineer', label: 'Security Engineer' },
  { value: 'software engineer', label: 'Software Engineer' },
  { value: 'ui/ux designer', label: 'UI/UX Designer' },
  { value: 'web developer', label: 'Web Developer' },
];

const DEGREE_OPTIONS = [
  { value: '', label: 'Não importa' },
  { value: 'required', label: 'Diploma necessário' },
  { value: 'not-required', label: 'Sem necessidade de diploma' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'Todos', icon: '🌍' },
  { value: 'greenhouse', label: 'Greenhouse', icon: '🏢' },
  { value: 'lever', label: 'Lever', icon: '⚙️' },
  { value: 'workable', label: 'Workable', icon: '🏗️' },
  { value: 'ashby', label: 'Ashby', icon: '🏛️' },
  { value: 'builtin', label: 'Built In', icon: '🏙️' },
  { value: 'weworkremotely', label: 'We Work Remotely', icon: '💼' },
  { value: 'remotive', label: 'Remotive', icon: '🚀' },
  { value: 'remoteyeah', label: 'RemoteYeah', icon: '🌟' },
];

const LOCATION_OPTIONS = [
  // Regions
  { value: 'Worldwide', label: 'Worldwide' },
  { value: 'Africa', label: 'Africa' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Latin America', label: 'Latin America' },
  { value: 'Middle East', label: 'Middle East' },
  { value: 'North America', label: 'North America' },
  { value: 'Oceania', label: 'Oceania' },
  // Countries (most common)
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Poland', label: 'Poland' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Chile', label: 'Chile' },
  { value: 'Australia', label: 'Australia' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'India', label: 'India' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Japan', label: 'Japan' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'China', label: 'China' },
  { value: 'Israel', label: 'Israel' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'South Africa', label: 'South Africa' },
];

const SKILLS_OPTIONS = [
  // Languages
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'C#', label: 'C#' },
  { value: 'C++', label: 'C++' },
  { value: 'C', label: 'C' },
  { value: 'Go', label: 'Go' },
  { value: 'Rust', label: 'Rust' },
  { value: 'Ruby', label: 'Ruby' },
  { value: 'PHP', label: 'PHP' },
  { value: 'Swift', label: 'Swift' },
  { value: 'Kotlin', label: 'Kotlin' },
  { value: 'Scala', label: 'Scala' },
  { value: 'Dart', label: 'Dart' },
  { value: 'R', label: 'R' },
  { value: 'SQL', label: 'SQL' },
  { value: 'HTML', label: 'HTML' },
  { value: 'CSS', label: 'CSS' },
  // Frontend Frameworks/Libraries
  { value: 'React', label: 'React' },
  { value: 'Vue.js', label: 'Vue.js' },
  { value: 'Angular', label: 'Angular' },
  { value: 'Svelte', label: 'Svelte' },
  { value: 'Next.js', label: 'Next.js' },
  { value: 'Nuxt.js', label: 'Nuxt.js' },
  { value: 'jQuery', label: 'jQuery' },
  // Backend Frameworks
  { value: 'Node.js', label: 'Node.js' },
  { value: 'Express.js', label: 'Express.js' },
  { value: 'NestJS', label: 'NestJS' },
  { value: 'Django', label: 'Django' },
  { value: 'Flask', label: 'Flask' },
  { value: 'FastAPI', label: 'FastAPI' },
  { value: 'Spring Boot', label: 'Spring Boot' },
  { value: 'Laravel', label: 'Laravel' },
  { value: 'Ruby on Rails', label: 'Ruby on Rails' },
  { value: '.NET', label: '.NET' },
  { value: 'ASP.NET', label: 'ASP.NET' },
  // Databases
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'MySQL', label: 'MySQL' },
  { value: 'MongoDB', label: 'MongoDB' },
  { value: 'Redis', label: 'Redis' },
  { value: 'SQLite', label: 'SQLite' },
  { value: 'Elasticsearch', label: 'Elasticsearch' },
  { value: 'DynamoDB', label: 'DynamoDB' },
  { value: 'Cassandra', label: 'Cassandra' },
  { value: 'Oracle', label: 'Oracle' },
  // Cloud/DevOps
  { value: 'AWS', label: 'AWS' },
  { value: 'Azure', label: 'Azure' },
  { value: 'GCP', label: 'GCP' },
  { value: 'Docker', label: 'Docker' },
  { value: 'Kubernetes', label: 'Kubernetes' },
  { value: 'Terraform', label: 'Terraform' },
  { value: 'Jenkins', label: 'Jenkins' },
  { value: 'GitLab CI', label: 'GitLab CI' },
  { value: 'GitHub Actions', label: 'GitHub Actions' },
  { value: 'CircleCI', label: 'CircleCI' },
  { value: 'Ansible', label: 'Ansible' },
  // Mobile
  { value: 'React Native', label: 'React Native' },
  { value: 'Flutter', label: 'Flutter' },
  { value: 'iOS', label: 'iOS' },
  { value: 'Android', label: 'Android' },
  // Tools/Other
  { value: 'Git', label: 'Git' },
  { value: 'GraphQL', label: 'GraphQL' },
  { value: 'REST API', label: 'REST API' },
  { value: 'Microservices', label: 'Microservices' },
  { value: 'Agile', label: 'Agile' },
  { value: 'Scrum', label: 'Scrum' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'AI', label: 'AI' },
  { value: 'Blockchain', label: 'Blockchain' },
];

export default function JobsPage() {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedSource, setSelectedSource] = useState('all'); // 'all', 'greenhouse', 'lever'
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Temporary salary value (for slider UI only)
  const [tempMinSalary, setTempMinSalary] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    platform: '', // Será definido baseado no selectedSource
    remote: true,
    seniority: [], // Array for multi-select
    employmentType: [], // Array for multi-select
    category: [], // Array for multi-select
    jobTitle: '',
    skills: [], // Array for multi-select
    benefits: '',
    location: [], // Array for multi-select
    degree: '',
    minSalary: '',
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
  }, []);

  // Debounce salary slider - only apply filter after user stops dragging
  useEffect(() => {
    if (tempMinSalary === '') return; // Skip on initial render

    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        minSalary: tempMinSalary,
        page: 1,
      }));
    }, 500); // Wait 500ms after user stops dragging

    return () => clearTimeout(timeoutId);
  }, [tempMinSalary]);

  useEffect(() => {
    // Load jobs when component mounts or filters change
    loadJobs();
  }, [filters]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        {/* Back Button */}
        <BackButton to="/home" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search className="text-copilot-accent-blue" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-copilot-text-primary">
                  Vagas Remotas
                  <span className="ml-3 text-2xl font-semibold text-copilot-accent-blue">
                    {pagination.total.toLocaleString('pt-BR')}
                  </span>
                </h1>
                <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-medium bg-copilot-accent-purple bg-opacity-10 text-copilot-accent-purple">
                  {SOURCE_OPTIONS.find(s => s.value === selectedSource)?.icon} {SOURCE_OPTIONS.find(s => s.value === selectedSource)?.label}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Saved Jobs Button */}
              <button
                onClick={() => navigate('/jobs/saved')}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600 hover:shadow-xl hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 active:shadow-inner active:translate-y-0.5 transition-all duration-200"
              >
                <Bookmark size={16} />
                <span className="font-semibold">Vagas Salvas</span>
              </button>
            </div>
          </div>
          <p className="text-copilot-text-secondary mb-4">
            {selectedSource === 'all' && 'Todas as vagas remotas de múltiplas plataformas e agregadores'}
            {selectedSource === 'greenhouse' && 'Vagas remotas de empresas que usam Greenhouse'}
            {selectedSource === 'lever' && 'Vagas remotas de empresas que usam Lever'}
            {selectedSource === 'workable' && 'Vagas remotas de empresas que usam Workable'}
            {selectedSource === 'ashby' && 'Vagas remotas de empresas que usam Ashby'}
            {selectedSource === 'builtin' && 'Vagas remotas do Built In'}
            {selectedSource === 'weworkremotely' && 'Vagas remotas do We Work Remotely'}
            {selectedSource === 'remotive' && 'Vagas remotas do Remotive'}
            {selectedSource === 'remoteyeah' && 'Vagas remotas do RemoteYeah'}
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
          <div className="space-y-4">
            {/* All Filters in One Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Job Category */}
              <div>
                <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                  Categoria
                </label>
                <MultiSelect
                  options={JOB_CATEGORIES}
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  placeholder="Select categories..."
                />
              </div>

              {/* Experience (Seniority) */}
              <div>
                <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                  Experiência
                </label>
                <MultiSelect
                  options={SENIORITY_OPTIONS}
                  value={filters.seniority}
                  onChange={(value) => handleFilterChange('seniority', value)}
                  placeholder="Select experience..."
                />
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                  Contratação
                </label>
                <MultiSelect
                  options={EMPLOYMENT_TYPE_OPTIONS}
                  value={filters.employmentType}
                  onChange={(value) => handleFilterChange('employmentType', value)}
                  placeholder="Select types..."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                  Localização
                </label>
                <MultiSelect
                  options={LOCATION_OPTIONS}
                  value={filters.location}
                  onChange={(value) => handleFilterChange('location', value)}
                  placeholder="Select locations..."
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-copilot-text-secondary mb-2">
                  Skills
                </label>
                <MultiSelect
                  options={SKILLS_OPTIONS}
                  value={filters.skills}
                  onChange={(value) => handleFilterChange('skills', value)}
                  placeholder="Select skills..."
                />
              </div>

              {/* Remote Only */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer h-[42px]">
                  <input
                    type="checkbox"
                    checked={filters.remote}
                    onChange={(e) => handleFilterChange('remote', e.target.checked)}
                    className="w-4 h-4 rounded border-copilot-border-default bg-copilot-bg-tertiary checked:bg-copilot-accent-blue"
                  />
                  <span className="text-sm text-copilot-text-secondary whitespace-nowrap">Apenas Remoto</span>
                </label>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setTempMinSalary('');
                  setFilters({
                    platform: selectedSource === 'all' ? '' : selectedSource,
                    remote: true,
                    seniority: [],
                    employmentType: [],
                    category: [],
                    jobTitle: '',
                    skills: [],
                    benefits: '',
                    location: [],
                    degree: '',
                    minSalary: '',
                    page: 1,
                    limit: 20,
                  });
                }}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600 hover:shadow-xl hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 active:shadow-inner active:translate-y-0.5 transition-all duration-200"
              >
                <X size={16} />
                <span className="font-semibold">Limpar Filtros</span>
              </button>
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
            <p className="text-copilot-text-tertiary">
              Tente ajustar os filtros
            </p>
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-gradient-to-br from-copilot-accent-blue to-blue-600 text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
          aria-label="Voltar ao topo"
        >
          <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}
