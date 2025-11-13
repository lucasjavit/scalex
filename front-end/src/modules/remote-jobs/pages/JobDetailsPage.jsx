import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Briefcase, Clock, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import BackButton from '../../../components/BackButton';
import { jobsService } from '../../../services/jobsService';
import { savedJobsService } from '../../../services/savedJobsService';
import { useNotification } from '../../../hooks/useNotification';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);

    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobData = await jobsService.getJobById(id);

      if (jobData) {
        setJob(jobData);

        // Check if job is saved
        if (userId) {
          const response = await savedJobsService.getSavedJobs(userId);
          if (response && response.data) {
            const isJobSaved = response.data.some(
              (saved) => saved.job?.id === jobData.id
            );
            setIsSaved(isJobSaved);
          }
        }
      } else {
        showError('Vaga não encontrada');
        navigate('/jobs');
      }
    } catch (error) {
      console.error('Error loading job:', error);
      showError('Erro ao carregar vaga');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!userId) {
      showError('Você precisa estar logado para salvar vagas');
      return;
    }

    setIsSaving(true);

    try {
      if (isSaved) {
        // Get all saved jobs to find the savedJobId
        const response = await savedJobsService.getSavedJobs(userId);
        if (response && response.data) {
          const savedJob = response.data.find(saved => saved.job?.id === job.id);
          if (savedJob) {
            await savedJobsService.deleteSavedJob(userId, savedJob.id);
            setIsSaved(false);
            showSuccess('Vaga removida com sucesso!');
          }
        }
      } else {
        await savedJobsService.saveJob(userId, job.id);
        setIsSaved(true);
        showSuccess('Vaga salva com sucesso!');
      }
    } catch (error) {
      if (error.message?.includes('já')) {
        setIsSaved(true);
        showInfo('Esta vaga já está salva');
      } else {
        showError('Erro ao salvar vaga. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  const getCompanyLogo = () => {
    if (job.company?.logo) {
      return job.company.logo;
    }

    if (job.companySlug) {
      const domain = job.company?.website || `${job.companySlug}.com`;
      return `https://logo.clearbit.com/${domain}`;
    }

    return null;
  };

  const getCompanyInitials = () => {
    if (!job.companySlug) return '?';

    const name = job.company?.name || job.companySlug.replace(/-/g, ' ');
    const words = name.split(' ');

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  const [logoError, setLogoError] = useState(false);

  if (loading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <BackButton to="/jobs" />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const logoUrl = getCompanyLogo();

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <BackButton to="/jobs" />

        {/* Job Header - Compact */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-lg p-4 mb-4">
          <div className="flex items-start gap-4 mb-3">
            {/* Company Logo - Smaller */}
            <div className="flex-shrink-0">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={job.company?.name || job.companySlug}
                  className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-copilot-accent-blue bg-opacity-10 flex items-center justify-center">
                  <span className="text-copilot-accent-blue font-bold text-sm">
                    {getCompanyInitials()}
                  </span>
                </div>
              )}
            </div>

            {/* Job Title and Company */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-copilot-text-primary mb-2">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Company Name */}
                {job.companySlug && (
                  <span className="text-sm font-semibold text-copilot-text-secondary capitalize">
                    {job.company?.name || job.companySlug.replace(/-/g, ' ')}
                  </span>
                )}

                {/* Platform Badge */}
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-copilot-accent-purple bg-opacity-10 text-copilot-accent-purple">
                  {job.platform}
                </span>

                {/* Remote Badge */}
                {job.remote && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500 bg-opacity-10 text-green-600 dark:text-green-400">
                    Remote
                  </span>
                )}
              </div>

              {/* Job Details - Compact */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Location */}
                <div className="flex items-center gap-1 text-copilot-text-secondary">
                  <MapPin size={12} className="flex-shrink-0" />
                  <span>{job.location || 'Location not specified'}</span>
                </div>

                {/* Salary */}
                {job.salary && (
                  <div className="flex items-center gap-1 text-copilot-text-primary font-semibold">
                    <DollarSign size={12} className="flex-shrink-0" />
                    <span>{job.salary}</span>
                  </div>
                )}

                {/* Seniority */}
                {job.seniority && (
                  <div className="flex items-center gap-1 text-copilot-text-secondary">
                    <Briefcase size={12} className="flex-shrink-0" />
                    <span className="capitalize">{job.seniority}</span>
                  </div>
                )}

                {/* Published Date */}
                <div className="flex items-center gap-1 text-copilot-text-secondary">
                  <Clock size={12} className="flex-shrink-0" />
                  <span>{formatDate(job.publishedAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {/* Save Button */}
              <button
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isSaved
                    ? 'bg-copilot-accent-blue bg-opacity-10 text-copilot-accent-blue hover:bg-opacity-20'
                    : 'bg-copilot-bg-tertiary text-copilot-text-secondary hover:text-copilot-accent-blue hover:bg-copilot-bg-primary'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isSaved ? 'Vaga salva' : 'Salvar vaga'}
              >
                {isSaving ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck size={16} />
                    <span>Salva</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={16} />
                    <span>Salvar</span>
                  </>
                )}
              </button>

              {/* Apply Button */}
              <a
                href={job.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-2xl hover:scale-105 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-300"
              >
                <span>Aplicar agora</span>
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Job Description - Compact */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-lg p-4">
          <h2 className="text-lg font-bold text-copilot-text-primary mb-3">
            Descrição da Vaga
          </h2>

          <div
            className="prose prose-sm prose-invert max-w-none text-copilot-text-secondary"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>
      </div>
    </div>
  );
}
