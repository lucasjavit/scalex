import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../services/adminApi';

const LessonList = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllLessons();
      setLessons(data);
    } catch (err) {
      setError('Erro ao carregar lições');
      console.error('Error loading lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId) => {
    try {
      await adminApi.deleteLesson(lessonId);
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      setShowDeleteModal(false);
      setLessonToDelete(null);
    } catch (err) {
      setError('Erro ao deletar lição');
      console.error('Error deleting lesson:', err);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      elementary: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getLevelLabel = (level) => {
    const labels = {
      beginner: 'Iniciante',
      elementary: 'Elementar',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
    };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-copilot p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadLessons}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-copilot hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-copilot-text-primary">Gerenciar Lições</h2>
        <button
          onClick={() => navigate('/admin/english-course/lessons/new')}
          className="bg-copilot-accent-primary text-white px-6 py-2 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Nova Lição
        </button>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 hover:border-copilot-accent-primary transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-copilot-text-primary mb-1">
                  Lição {lesson.lessonNumber}
                </h3>
                <p className="text-copilot-text-secondary text-sm mb-2">
                  {lesson.title}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(lesson.level)}`}
              >
                {getLevelLabel(lesson.level)}
              </span>
            </div>

            {lesson.description && (
              <p className="text-copilot-text-secondary text-sm mb-4 line-clamp-2">
                {lesson.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-copilot-text-secondary mb-4">
              <span>{lesson.questions?.length || 0} questões</span>
              <span className={`px-2 py-1 rounded ${lesson.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {lesson.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/english-course/lessons/${lesson.id}/edit`)}
                className="flex-1 bg-copilot-accent-primary text-white px-4 py-2 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => navigate(`/admin/english-course/lessons/${lesson.id}/questions`)}
                className="flex-1 bg-copilot-accent-secondary text-white px-4 py-2 rounded-copilot hover:bg-copilot-accent-secondary/90 transition-colors text-sm"
              >
                Questões
              </button>
              <button
                onClick={() => {
                  setLessonToDelete(lesson);
                  setShowDeleteModal(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-copilot hover:bg-red-700 transition-colors text-sm"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-copilot-text-primary mb-2">
            Nenhuma lição encontrada
          </h3>
          <p className="text-copilot-text-secondary mb-6">
            Comece criando sua primeira lição
          </p>
          <button
            onClick={() => navigate('/admin/english-course/lessons/new')}
            className="bg-copilot-accent-primary text-white px-6 py-3 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors"
          >
            Criar Primeira Lição
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && lessonToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-copilot p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-copilot-text-secondary mb-6">
              Tem certeza que deseja deletar a lição "{lessonToDelete.title}"? 
              Esta ação não pode ser desfeita e todas as questões associadas serão removidas.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setLessonToDelete(null);
                }}
                className="px-4 py-2 text-copilot-text-secondary hover:text-copilot-text-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(lessonToDelete.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-copilot hover:bg-red-700 transition-colors"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonList;
