import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, Edit, ExternalLink, Filter } from 'lucide-react';
import BackButton from '../../../components/BackButton';
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
  const [userId, setUserId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

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

  const loadSavedJobs = async (uid) => {
    try {
      setLoading(true);
      const response = await savedJobsService.getSavedJobs(uid);

      if (response && response.data) {
        setSavedJobs(response.data);
        setFilteredJobs(response.data);
      }
    } catch (error) {
      showError('Erro ao carregar vagas salvas');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs by status
  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredJobs(savedJobs);
    } else {
      setFilteredJobs(savedJobs.filter(job => job.status === selectedStatus));
    }
  }, [selectedStatus, savedJobs]);

  // Count jobs by status
  const getStatusCount = (status) => {
    if (status === 'all') return savedJobs.length;
    return savedJobs.filter(job => job.status === status).length;
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

  const handleDeleteClick = (savedJobId, jobTitle) => {
    setJobToDelete({ id: savedJobId, title: jobTitle });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userId || !jobToDelete) return;

    try {
      await savedJobsService.deleteSavedJob(userId, jobToDelete.id);

      // Update local state
      setSavedJobs(prev => prev.filter(job => job.id !== jobToDelete.id));

      showSuccess('Vaga removida com sucesso!');
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting saved job:', error);
      showError('Erro ao remover vaga');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
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
        {/* Back Button */}
        <BackButton to="/jobs" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="text-copilot-accent-blue" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-copilot-text-primary">
                Vagas Salvas
                <span className="ml-3 text-2xl font-semibold text-copilot-accent-blue">
                  {filteredJobs.length}
                </span>
              </h1>
            </div>
          </div>
          <p className="text-copilot-text-secondary mb-6">
            Gerencie suas vagas salvas e acompanhe seu progresso
          </p>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* All Jobs */}
            <button
              onClick={() => setSelectedStatus('all')}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2
                ${selectedStatus === 'all'
                  ? 'bg-copilot-accent-blue text-white shadow-lg'
                  : 'bg-copilot-bg-secondary text-copilot-text-secondary border border-copilot-border-default hover:border-copilot-accent-blue'
                }
              `}
            >
              <span>Todas</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${selectedStatus === 'all'
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-copilot-bg-tertiary text-copilot-text-tertiary'
                }
              `}>
                {getStatusCount('all')}
              </span>
            </button>

            {/* Status Options */}
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2
                  ${selectedStatus === status.value
                    ? 'bg-copilot-accent-blue text-white shadow-lg'
                    : 'bg-copilot-bg-secondary text-copilot-text-secondary border border-copilot-border-default hover:border-copilot-accent-blue'
                  }
                `}
              >
                <span>{status.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${selectedStatus === status.value
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'bg-copilot-bg-tertiary text-copilot-text-tertiary'
                  }
                `}>
                  {getStatusCount(status.value)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {savedJobs.length === 0 ? (
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-12 text-center">
            <Bookmark className="mx-auto mb-4 text-copilot-text-tertiary" size={48} />
            <p className="text-copilot-text-secondary text-lg mb-2">
              Nenhuma vaga salva
            </p>
            <p className="text-copilot-text-tertiary">
              Explore vagas e salve as que te interessam
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-12 text-center">
            <Filter className="mx-auto mb-4 text-copilot-text-tertiary" size={48} />
            <p className="text-copilot-text-secondary text-lg mb-2">
              Nenhuma vaga com este status
            </p>
            <p className="text-copilot-text-tertiary">
              Tente selecionar outro filtro
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredJobs.map(savedJob => (
              <SavedJobCard
                key={savedJob.id}
                savedJob={savedJob}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteClick}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-copilot-text-primary mb-3">
              Confirmar remoção
            </h3>
            <p className="text-copilot-text-secondary mb-2">
              Tem certeza que deseja remover esta vaga?
            </p>
            <p className="text-sm font-semibold text-copilot-accent-blue mb-6">
              {jobToDelete?.title}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 rounded-lg bg-copilot-bg-tertiary text-copilot-text-secondary hover:bg-copilot-bg-primary transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all font-medium"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-lg p-3 hover:border-copilot-accent-blue transition-all duration-200">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-copilot-text-primary mb-1 truncate">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-copilot-accent-purple bg-opacity-10 text-copilot-accent-purple">
              {job.platform}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${statusColorClasses[statusColor]}`}>
              {STATUS_OPTIONS.find(opt => opt.value === savedJob.status)?.label}
            </span>
            {savedJob.appliedAt && (
              <span className="text-xs text-copilot-text-tertiary">
                • Aplicado em {formatDate(savedJob.appliedAt)}
              </span>
            )}
          </div>
          <p className="text-copilot-text-secondary text-xs truncate">{job.location}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          {/* Status Change */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-1 rounded bg-copilot-bg-tertiary text-copilot-text-secondary hover:bg-copilot-bg-primary hover:text-copilot-accent-blue transition-all"
              title="Alterar status"
            >
              <Edit size={14} />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 bg-copilot-bg-secondary border border-copilot-border-default rounded-lg shadow-copilot-xl z-10 min-w-[140px]">
                {STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onStatusChange(savedJob.id, option.value);
                      setShowStatusMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 text-xs text-copilot-text-secondary hover:bg-copilot-bg-tertiary transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => onDelete(savedJob.id, job.title)}
            className="p-1 rounded bg-copilot-bg-tertiary text-copilot-text-secondary hover:bg-red-500 hover:bg-opacity-10 hover:text-red-600 transition-all"
            title="Remover vaga"
          >
            <Trash2 size={14} />
          </button>

          {/* External Link */}
          <a
            href={job.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded bg-copilot-bg-tertiary text-copilot-text-secondary hover:bg-copilot-bg-primary hover:text-copilot-accent-blue transition-all"
            title="Abrir vaga"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Notes */}
      {savedJob.notes && (
        <div className="bg-copilot-bg-tertiary border border-copilot-border-subtle rounded p-1.5 mt-1.5">
          <p className="text-xs text-copilot-text-tertiary mb-0.5">Notas:</p>
          <p className="text-xs text-copilot-text-secondary line-clamp-2">{savedJob.notes}</p>
        </div>
      )}

      {/* Saved Date */}
      <p className="text-xs text-copilot-text-tertiary mt-1.5">
        Salva em {formatDate(savedJob.createdAt)}
      </p>
    </div>
  );
}
