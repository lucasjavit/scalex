import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import AdminLayout from '../AdminLayout';

const LessonForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    lessonNumber: '',
    title: '',
    description: '',
    level: 'beginner',
    grammarFocus: '',
    vocabularyFocus: [],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vocabularyInput, setVocabularyInput] = useState('');

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'elementary', label: 'Elementary' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  useEffect(() => {
    if (isEdit) {
      loadLesson();
    }
  }, [id, isEdit]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const lesson = await adminApi.getLessonById(id);
      setFormData({
        lessonNumber: lesson.lessonNumber.toString(),
        title: lesson.title,
        description: lesson.description || '',
        level: lesson.level,
        grammarFocus: lesson.grammarFocus || '',
        vocabularyFocus: lesson.vocabularyFocus || [],
        isActive: lesson.isActive,
      });
    } catch (err) {
      setError('Error loading lesson');
      console.error('Error loading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleVocabularyAdd = () => {
    if (vocabularyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        vocabularyFocus: [...prev.vocabularyFocus, vocabularyInput.trim()],
      }));
      setVocabularyInput('');
    }
  };

  const handleVocabularyRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      vocabularyFocus: prev.vocabularyFocus.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        lessonNumber: parseInt(formData.lessonNumber),
        vocabularyFocus: formData.vocabularyFocus,
      };

      if (isEdit) {
        await adminApi.updateLesson(id, submitData);
      } else {
        await adminApi.createLesson(submitData);
      }

      navigate('/admin/english-course');
    } catch (err) {
      setError('Error saving lesson');
      console.error('Error saving lesson:', err);
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-copilot-text-primary">
            {isEdit ? 'Edit Lesson' : 'New Lesson'}
          </h2>
          <p className="text-copilot-text-secondary mt-1">
            {isEdit ? 'Update lesson information' : 'Fill in the data to create a new lesson'}
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
              Lesson Number *
            </label>
            <input
              type="number"
              name="lessonNumber"
              value={formData.lessonNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-copilot-text-primary mb-2">
              Level *
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-copilot-text-primary mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-copilot-text-primary mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-copilot-text-primary mb-2">
            Grammar Focus
          </label>
          <textarea
            name="grammarFocus"
            value={formData.grammarFocus}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-copilot-text-primary mb-2">
            Vocabulary Focus
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={vocabularyInput}
              onChange={(e) => setVocabularyInput(e.target.value)}
              placeholder="Type a word or phrase"
              className="flex-1 px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleVocabularyAdd())}
            />
            <button
              type="button"
              onClick={handleVocabularyAdd}
              className="bg-copilot-accent-primary text-white px-4 py-2 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.vocabularyFocus.map((vocab, index) => (
              <span
                key={index}
                className="bg-copilot-accent-primary/10 text-copilot-accent-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {vocab}
                <button
                  type="button"
                  onClick={() => handleVocabularyRemove(index)}
                  className="text-copilot-accent-primary hover:text-red-600 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-copilot-accent-primary focus:ring-copilot-accent-primary border-copilot-border-default rounded"
          />
          <label className="ml-2 text-sm text-copilot-text-primary">
            Active lesson
          </label>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/english-course')}
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

export default LessonForm;
