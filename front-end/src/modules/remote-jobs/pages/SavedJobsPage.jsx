import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, Edit, ExternalLink, Filter } from 'lucide-react';
import { savedJobsService } from '../../../services/savedJobsService';
import { useNotification } from '../../../hooks/useNotification';

const STATUS_OPTIONS = [
  { value: 'saved', label: 'Salva', color: 'blue' },
  { value: 'applied', label: 'Candidatado', color: 'purple' },
  { value: 'interviewing', label: 'Em entrevista', color: 'yellow' },
  { value: 'rejected', label: 'Rejeitado', color: 'red' },
  { value: 'accepted', label: 'Aceito', color: 'green' },
];

export default function SavedJobsPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [savedJobs, setSavedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, saved, applied, etc.
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      showError('Você precisa estar logado');
      navigate('/login');
      return;
    }
    setUserId(storedUserId);
    loadSavedJobs(storedUserId);
  }, []);

  useEffect(() => {
    // Apply filter
    if (filter === 'all') {
      setFilteredJobs(savedJobs);
    } else {
      setFilteredJobs(savedJobs.filter(job => job.status === filter));
    }
  }, [filter, savedJobs]);

  const loadSavedJobs = async (uid) => {
    try {
      setLoading(true);
      const response = await savedJobsService.getSavedJobs(uid);

      if (response && response.data) {
        setSavedJobs(response.data);
        setFilteredJobs(response.data);
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      showError('Erro ao carregar vagas salvas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (savedJobId, newStatus, notes = undefined) => {
    if (!userId) return;

    try {
      await savedJobsService.updateJobStatus(userId, savedJobId, newStatus, notes);

      // Update local state
      setSavedJobs(prev =>
        prev.map(job =>
          job.id === savedJobId
            ? { ...job, status: newStatus, appliedAt: newStatus === 'applied' ? new Date() : job.appliedAt }
            : job
        )
      );

      showSuccess('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Erro ao atualizar status');
    }
  };

  const handleDelete = async (savedJobId) => {
    if (!userId) return;
    if (!confirm('Tem certeza que deseja remover esta vaga?')) return;

    try {
      await savedJobsService.deleteSavedJob(userId, savedJobId);

      // Update local state
      setSavedJobs(prev => prev.filter(job => job.id !== savedJobId));

      showSuccess('Vaga removida com sucesso!');
    } catch (error) {
      console.error('Error deleting saved job:', error);
      showError('Erro ao remover vaga');
    }
  };

  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.color || 'gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-copilot-accent-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Carregando vagas salvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="text-copilot-accent-blue" size={32} />
            <h1 className="text-3xl font-bold text-copilot-text-primary">Vagas Salvas</h1>
          </div>
          <p className="text-copilot-text-secondary">
            Gerencie suas vagas salvas e acompanhe seu progresso
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-copilot-accent-blue text-white'
                : 'bg-copilot-bg-secondary text-copilot-text-secondary hover:bg-copilot-bg-tertiary'
            }`}
          >
            Todas ({savedJobs.length})
          </button>
          {STATUS_OPTIONS.map(option => {
            const count = savedJobs.filter(job => job.status === option.value).length;
            return (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === option.value
                    ? 'bg-copilot-accent-blue text-white'
                    : 'bg-copilot-bg-secondary text-copilot-text-secondary hover:bg-copilot-bg-tertiary'
                }`}
              >
                {option.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-12 text-center">
            <Bookmark className="mx-auto mb-4 text-copilot-text-tertiary" size={48} />
            <p className="text-copilot-text-secondary text-lg mb-2">
              {filter === 'all' ? 'Nenhuma vaga salva' : `Nenhuma vaga com status "${STATUS_OPTIONS.find(o => o.value === filter)?.label}"`}
            </p>
            <p className="text-copilot-text-tertiary mb-4">
              Explore vagas e salve as que te interessam
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="btn-copilot-primary"
            >
              Explorar vagas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(savedJob => (
              <SavedJobCard
                key={savedJob.id}
                savedJob={savedJob}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Saved Job Card Component
function SavedJobCard({ savedJob, onStatusChange, onDelete, getStatusColor, formatDate }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const job = savedJob.job;

  const statusColor = getStatusColor(savedJob.status);
  const statusColorClasses = {
    blue: 'bg-blue-500 bg-opacity-10 text-blue-600 dark:text-blue-400 border-blue-500',
    purple: 'bg-purple-500 bg-opacity-10 text-purple-600 dark:text-purple-400 border-purple-500',
    yellow: 'bg-yellow-500 bg-opacity-10 text-yellow-600 dark:text-yellow-400 border-yellow-500',
    red: 'bg-red-500 bg-opacity-10 text-red-600 dark:text-red-400 border-red-500',
    green: 'bg-green-500 bg-opacity-10 text-green-600 dark:text-green-400 border-green-500',
  };

  return (
    <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 hover:border-copilot-accent-blue transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-copilot-text-primary mb-2">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-copilot-accent-purple bg-opacity-10 text-copilot-accent-purple">
              {job.platform}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColorClasses[statusColor]}`}>
              {STATUS_OPTIONS.find(opt => opt.value === savedJob.status)?.label}
            </span>
            {savedJob.appliedAt && (
              <span className="text-xs text-copilot-text-tertiary">
                Aplicado em {formatDate(savedJob.appliedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Status Change */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-2 rounded-lg bg-copilot-bg-tertiary text-copilot-text-secondary hover:bg-copilot-bg-primary hover:text-copilot-accent-blue transition-all"
              title="Alterar status"
            >
              <Edit size={18} />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-2 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot-xl z-10 min-w-[160px]">
                {STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onStatusChange(savedJob.id, option.value);
                      setShowStatusMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-copilot-text-secondary hover:bg-copilot-bg-tertiary transition-colors first:rounded-t-copilot last:rounded-b-copilot"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => onDelete(savedJob.id)}
            className="p-2 rounded-lg bg-copilot-bg-tertiary text-copilot-text-secondary hover:bg-red-500 hover:bg-opacity-10 hover:text-red-600 transition-all"
            title="Remover vaga"
          >
            <Trash2 size={18} />
          </button>

          {/* External Link */}
          <a
            href={job.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-copilot-bg-tertiary text-copilot-text-secondary hover:bg-copilot-bg-primary hover:text-copilot-accent-blue transition-all"
            title="Abrir vaga"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      {/* Job Details */}
      <p className="text-copilot-text-secondary text-sm mb-3">{job.location}</p>

      {/* Notes */}
      {savedJob.notes && (
        <div className="bg-copilot-bg-tertiary border border-copilot-border-subtle rounded-md p-3 mt-3">
          <p className="text-xs text-copilot-text-tertiary mb-1">Notas:</p>
          <p className="text-sm text-copilot-text-secondary">{savedJob.notes}</p>
        </div>
      )}

      {/* Saved Date */}
      <p className="text-xs text-copilot-text-tertiary mt-3">
        Salva em {formatDate(savedJob.createdAt)}
      </p>
    </div>
  );
}
