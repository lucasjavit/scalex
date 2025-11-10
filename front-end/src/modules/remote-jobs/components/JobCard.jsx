import { useState } from 'react';
import { Bookmark, BookmarkCheck, MapPin, DollarSign, Briefcase, Clock } from 'lucide-react';
import { savedJobsService } from '../../../services/savedJobsService';
import { useNotification } from '../../../hooks/useNotification';

export default function JobCard({ job, userId, isSaved: initialIsSaved = false, onSaveToggle }) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError, showInfo } = useNotification();

  const handleSaveToggle = async (e) => {
    e.stopPropagation(); // Prevent card click

    if (!userId) {
      showError('Você precisa estar logado para salvar vagas');
      return;
    }

    setIsSaving(true);

    try {
      if (isSaved) {
        // TODO: Implement unsave functionality
        showInfo('Funcionalidade de remover vaga em desenvolvimento');
      } else {
        // Save job
        await savedJobsService.saveJob(userId, job);
        setIsSaved(true);
        showSuccess('Vaga salva com sucesso!');

        // Notify parent component
        if (onSaveToggle) {
          onSaveToggle(job, true);
        }
      }
    } catch (error) {
      console.error('Error toggling save status:', error);

      // Check if job is already saved
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

  return (
    <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 hover:border-copilot-accent-blue transition-all duration-200 hover:shadow-copilot-lg relative">
      {/* Save Button */}
      <button
        onClick={handleSaveToggle}
        disabled={isSaving}
        className={`absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 ${
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
        {/* Title and Company */}
        <h3 className="text-xl font-bold text-copilot-text-primary mb-2 hover:text-copilot-accent-blue transition-colors cursor-pointer">
          {job.title}
        </h3>

        {/* Company - Platform Badge */}
        <div className="flex items-center gap-2 mb-4">
          {/* Company Name */}
          {job.companySlug && (
            <span className="text-sm font-semibold text-copilot-text-secondary capitalize">
              {job.companySlug.replace(/-/g, ' ')}
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

        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-copilot-text-secondary text-sm">
            <MapPin size={16} className="flex-shrink-0" />
            <span>{job.location || 'Location not specified'}</span>
          </div>

          {/* Salary */}
          {job.salary && (
            <div className="flex items-center gap-2 text-copilot-text-secondary text-sm">
              <DollarSign size={16} className="flex-shrink-0" />
              <span>{job.salary}</span>
            </div>
          )}

          {/* Seniority */}
          {job.seniority && (
            <div className="flex items-center gap-2 text-copilot-text-secondary text-sm">
              <Briefcase size={16} className="flex-shrink-0" />
              <span className="capitalize">{job.seniority}</span>
            </div>
          )}

          {/* Published Date */}
          <div className="flex items-center gap-2 text-copilot-text-secondary text-sm">
            <Clock size={16} className="flex-shrink-0" />
            <span>{formatDate(job.publishedAt)}</span>
          </div>
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-md bg-copilot-bg-tertiary text-copilot-text-secondary border border-copilot-border-subtle"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 5 && (
              <span className="px-2 py-1 text-xs rounded-md text-copilot-text-tertiary">
                +{job.tags.length - 5} mais
              </span>
            )}
          </div>
        )}

        {/* Description Preview */}
        <p className="text-copilot-text-secondary text-sm line-clamp-2 mb-4">
          {job.description?.replace(/<[^>]*>/g, '').substring(0, 150)}...
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <a
            href={job.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-copilot-primary text-sm"
          >
            Ver detalhes
          </a>
          <a
            href={job.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-copilot-secondary text-sm"
          >
            Aplicar agora
          </a>
        </div>
      </div>
    </div>
  );
}
