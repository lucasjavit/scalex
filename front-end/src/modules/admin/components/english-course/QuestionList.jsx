import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';

const QuestionList = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    loadData();
  }, [lessonId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonData, questionsData] = await Promise.all([
        adminApi.getLessonById(lessonId),
        adminApi.getQuestionsByLesson(lessonId),
      ]);
      setLesson(lessonData);
      setQuestions(questionsData);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    try {
      await adminApi.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
      setShowDeleteModal(false);
      setQuestionToDelete(null);
    } catch (err) {
      setError('Erro ao deletar questão');
      console.error('Error deleting question:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return;
    
    try {
      await adminApi.deleteQuestionsBulk(selectedQuestions);
      setQuestions(questions.filter(q => !selectedQuestions.includes(q.id)));
      setSelectedQuestions([]);
    } catch (err) {
      setError('Erro ao deletar questões');
      console.error('Error bulk deleting questions:', err);
    }
  };

  const handleSelectQuestion = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil',
    };
    return labels[difficulty] || difficulty;
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
          onClick={loadData}
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
        <div>
          <h2 className="text-2xl font-bold text-copilot-text-primary">
            Questões - {lesson?.title}
          </h2>
          <p className="text-copilot-text-secondary">
            Lição {lesson?.lessonNumber} • {questions.length} questões
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/english-course/lessons/${lessonId}/questions/new`)}
            className="bg-copilot-accent-primary text-white px-4 py-2 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Nova Questão
          </button>
          <button
            onClick={() => navigate(`/admin/english-course/lessons/${lessonId}/questions/bulk`)}
            className="bg-copilot-accent-secondary text-white px-4 py-2 rounded-copilot hover:bg-copilot-accent-secondary/90 transition-colors flex items-center gap-2"
          >
            <span>📝</span>
            Criar em Lote
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <div className="bg-copilot-accent-primary/10 border border-copilot-accent-primary/20 rounded-copilot p-4">
          <div className="flex items-center justify-between">
            <span className="text-copilot-accent-primary font-medium">
              {selectedQuestions.length} questão(ões) selecionada(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-copilot hover:bg-red-700 transition-colors text-sm"
              >
                Deletar Selecionadas
              </button>
              <button
                onClick={() => setSelectedQuestions([])}
                className="bg-gray-600 text-white px-4 py-2 rounded-copilot hover:bg-gray-700 transition-colors text-sm"
              >
                Limpar Seleção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot">
            <input
              type="checkbox"
              checked={selectedQuestions.length === questions.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-copilot-accent-primary focus:ring-copilot-accent-primary border-copilot-border-default rounded"
            />
            <span className="text-sm text-copilot-text-secondary">
              Selecionar todas ({questions.length})
            </span>
          </div>
        )}

        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 hover:border-copilot-accent-primary transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={selectedQuestions.includes(question.id)}
                onChange={() => handleSelectQuestion(question.id)}
                className="h-4 w-4 text-copilot-accent-primary focus:ring-copilot-accent-primary border-copilot-border-default rounded mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-copilot-text-secondary">
                    Questão {question.questionNumber}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                  >
                    {getDifficultyLabel(question.difficulty)}
                  </span>
                </div>

                <h3 className="font-semibold text-copilot-text-primary mb-2">
                  {question.questionText}
                </h3>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-copilot-text-secondary">Resposta esperada:</span>
                    <p className="text-copilot-text-primary">{question.expectedAnswer}</p>
                  </div>

                  {question.alternativeAnswers && question.alternativeAnswers.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-copilot-text-secondary">Respostas alternativas:</span>
                      <p className="text-copilot-text-primary">
                        {question.alternativeAnswers.join(', ')}
                      </p>
                    </div>
                  )}

                  {question.grammarPoint && (
                    <div>
                      <span className="text-sm font-medium text-copilot-text-secondary">Ponto gramatical:</span>
                      <p className="text-copilot-text-primary">{question.grammarPoint}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/english-course/lessons/${lessonId}/questions/${question.id}/edit`)}
                  className="bg-copilot-accent-primary text-white px-3 py-1 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    setQuestionToDelete(question);
                    setShowDeleteModal(true);
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded-copilot hover:bg-red-700 transition-colors text-sm"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-semibold text-copilot-text-primary mb-2">
            Nenhuma questão encontrada
          </h3>
          <p className="text-copilot-text-secondary mb-6">
            Comece criando questões para esta lição
          </p>
          <button
            onClick={() => navigate(`/admin/english-course/lessons/${lessonId}/questions/new`)}
            className="bg-copilot-accent-primary text-white px-6 py-3 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors"
          >
            Criar Primeira Questão
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && questionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-copilot p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-copilot-text-secondary mb-6">
              Tem certeza que deseja deletar esta questão? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setQuestionToDelete(null);
                }}
                className="px-4 py-2 text-copilot-text-secondary hover:text-copilot-text-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(questionToDelete.id)}
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

export default QuestionList;
