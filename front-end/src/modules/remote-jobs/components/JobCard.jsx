import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, MapPin, DollarSign, Briefcase, Clock } from 'lucide-react';
import { savedJobsService } from '../../../services/savedJobsService';
import { useNotification } from '../../../hooks/useNotification';

export default function JobCard({ job, userId, isSaved: initialIsSaved = false, onSaveToggle }) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError, showInfo } = useNotification();

  const handleSaveToggle = async (e) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Prevent card click

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

            // Notify parent component
            if (onSaveToggle) {
              onSaveToggle(job, false);
            }
          }
        }
      } else {
        // Save job
        const response = await savedJobsService.saveJob(userId, job.id);

        setIsSaved(true);
        showSuccess('Vaga salva com sucesso!');

        // Notify parent component
        if (onSaveToggle) {
          onSaveToggle(job, true);
        }
      }
    } catch (error) {
      // Check if job is already saved
      if (error.message?.includes('já')) {
        setIsSaved(true);
        showInfo('Esta vaga já está salva');
      } else {
        showError(`Erro ao salvar vaga: ${error.message || 'Tente novamente.'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Format date
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

  // Get company logo URL
  const getCompanyLogo = () => {
    // If company has logo in database, use it
    if (job.company?.logo) {
      return job.company.logo;
    }

    // Otherwise, try Clearbit Logo API (free, no auth required)
    if (job.companySlug) {
      const domain = job.company?.website || `${job.companySlug}.com`;
      return `https://logo.clearbit.com/${domain}`;
    }

    return null;
  };

  // Get company initials for fallback
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
  const logoUrl = getCompanyLogo();

  return (
    <Link
      to={`/jobs/details/${job.id}`}
      className="block bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 hover:border-copilot-accent-blue transition-all duration-200 hover:shadow-copilot-lg relative cursor-pointer"
    >
      {/* Save Button */}
      <button
        onClick={handleSaveToggle}
        disabled={isSaving}
        className={`absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 z-10 ${
          isSaved
            ? 'bg-copilot-accent-blue bg-opacity-10 text-copilot-accent-blue hover:bg-opacity-20'
            : 'bg-copilot-bg-tertiary text-copilot-text-secondary hover:text-copilot-accent-blue hover:bg-copilot-bg-primary'
        } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isSaved ? 'Vaga salva' : 'Salvar vaga'}
      >
        {isSaving ? (
          <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
        ) : isSaved ? (
          <BookmarkCheck size={20} />
        ) : (
          <Bookmark size={20} />
        )}
      </button>

      {/* Job Content */}
      <div className="pr-12">
        {/* Company Logo and Title */}
        <div className="flex items-start gap-4 mb-3">
          {/* Company Logo */}
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

          {/* Title */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-copilot-text-primary mb-2 hover:text-copilot-accent-blue transition-colors cursor-pointer">
              {job.title}
            </h3>
          </div>
        </div>

        {/* Company - Platform Badge */}
        <div className="flex items-center gap-2 mb-4">
          {/* Company Name */}
          {job.companySlug && (
            <span className="text-sm font-semibold text-copilot-text-secondary capitalize">
              {job.company?.name || job.companySlug.replace(/-/g, ' ')}
            </span>
          )}

          {/* Platform Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-copilot-accent-purple bg-opacity-10 text-copilot-accent-purple">
            {job.platform}
          </span>

          {/* Remote Badge */}
          {job.remote && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 bg-opacity-10 text-green-600 dark:text-green-400">
              Remote
            </span>
          )}
        </div>

        {/* Job Details Row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-copilot-text-secondary text-sm">
            <MapPin size={14} className="flex-shrink-0" />
            <span>{job.location || 'Location not specified'}</span>
          </div>

          {/* Salary */}
          {job.salary && (
            <div className="flex items-center gap-1.5 text-copilot-text-primary text-sm font-semibold">
              <DollarSign size={14} className="flex-shrink-0" />
              <span>{job.salary}</span>
            </div>
          )}

          {/* Seniority */}
          {job.seniority && (
            <div className="flex items-center gap-1.5 text-copilot-text-secondary text-sm">
              <Briefcase size={14} className="flex-shrink-0" />
              <span className="capitalize">{job.seniority}</span>
            </div>
          )}

          {/* Published Date */}
          <div className="flex items-center gap-1.5 text-copilot-text-secondary text-sm">
            <Clock size={14} className="flex-shrink-0" />
            <span>{formatDate(job.publishedAt)}</span>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-copilot-text-secondary text-sm line-clamp-2">
          {job.description?.replace(/<[^>]*>/g, '').substring(0, 150)}...
        </p>
      </div>
    </Link>
  );
}
