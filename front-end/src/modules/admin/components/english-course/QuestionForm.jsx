import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import AdminLayout from '../AdminLayout';

const QuestionForm = () => {
  const { lessonId, questionId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(questionId);

  const [formData, setFormData] = useState({
    questionNumber: '',
    questionText: '',
    expectedAnswer: '',
    alternativeAnswers: [],
    grammarPoint: '',
    difficulty: 'medium',
    audioUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alternativeInput, setAlternativeInput] = useState('');
  const [lesson, setLesson] = useState(null);

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  useEffect(() => {
    loadLesson();
    if (isEdit) {
      loadQuestion();
    }
  }, [lessonId, questionId, isEdit]);

  const loadLesson = async () => {
    try {
      const lessonData = await adminApi.getLessonById(lessonId);
      setLesson(lessonData);
    } catch (err) {
      setError('Error loading lesson');
      console.error('Error loading lesson:', err);
    }
  };

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const question = await adminApi.getQuestionById(questionId);
      setFormData({
        questionNumber: question.questionNumber.toString(),
        questionText: question.questionText,
        expectedAnswer: question.expectedAnswer,
        alternativeAnswers: question.alternativeAnswers || [],
        grammarPoint: question.grammarPoint || '',
        difficulty: question.difficulty,
        audioUrl: question.audioUrl || '',
      });
    } catch (err) {
      setError('Error loading question');
      console.error('Error loading question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAlternativeAdd = () => {
    if (alternativeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        alternativeAnswers: [...prev.alternativeAnswers, alternativeInput.trim()],
      }));
      setAlternativeInput('');
    }
  };

  const handleAlternativeRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      alternativeAnswers: prev.alternativeAnswers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        lessonId,
        questionNumber: parseInt(formData.questionNumber),
        alternativeAnswers: formData.alternativeAnswers,
      };

      if (isEdit) {
        await adminApi.updateQuestion(questionId, submitData);
      } else {
        await adminApi.createQuestion(submitData);
      }

      navigate(`/admin/english-course/lessons/${lessonId}/questions`);
    } catch (err) {
      setError('Error saving question');
      console.error('Error saving question:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-copilot-text-primary">
            {isEdit ? 'Edit Question' : 'New Question'}
          </h2>
          <p className="text-copilot-text-secondary mt-1">
            {lesson && `Lesson ${lesson.lessonNumber}: ${lesson.title}`}
          </p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-copilot p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-copilot-text-primary mb-2">
              Question Number *
            </label>
            <input
              type="number"
              name="questionNumber"
              value={formData.questionNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-copilot-text-primary mb-2">
              Difficulty *
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-copilot-text-primary mb-2">
            Question Text *
          </label>
          <textarea
            name="questionText"
            value={formData.questionText}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
            placeholder="Type the question or instruction..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-copilot-text-primary mb-2">
            Expected Answer *
          </label>
          <textarea
            name="expectedAnswer"
            value={formData.expectedAnswer}
            onChange={handleInputChange}
            required
            rows={2}
            className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
            placeholder="Type the correct answer..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-copilot-text-primary mb-2">
            Alternative Answers
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={alternativeInput}
              onChange={(e) => setAlternativeInput(e.target.value)}
              placeholder="Type an alternative answer"
              className="flex-1 px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAlternativeAdd())}
            />
            <button
              type="button"
              onClick={handleAlternativeAdd}
              className="bg-copilot-accent-primary text-white px-4 py-2 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.alternativeAnswers.map((answer, index) => (
              <span
                key={index}
                className="bg-copilot-accent-primary/10 text-copilot-accent-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {answer}
                <button
                  type="button"
                  onClick={() => handleAlternativeRemove(index)}
                  className="text-copilot-accent-primary hover:text-red-600 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-copilot-text-primary mb-2">
            Grammar Point
          </label>
          <input
            type="text"
            name="grammarPoint"
            value={formData.grammarPoint}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
            placeholder="Ex: Present Simple, Past Continuous, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-copilot-text-primary mb-2">
            Audio URL (optional)
          </label>
          <input
            type="url"
            name="audioUrl"
            value={formData.audioUrl}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
            placeholder="https://exemplo.com/audio.mp3"
          />
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/admin/english-course/lessons/${lessonId}/questions`)}
            className="px-6 py-2 border border-copilot-border-default text-copilot-text-secondary rounded-copilot hover:bg-copilot-bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-copilot-accent-primary text-white rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
      </div>
    </AdminLayout>
  );
};

export default QuestionForm;
