import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../../../services/api';
import { useAuth } from '../../../auth-social/context/AuthContext';

const Progress = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation(['englishCourse', 'common']);

  // Function to translate lesson data
  const translateLessonData = (lessonData) => {
    if (!lessonData) return lessonData;
    
    const lessonTranslations = {
      'Basic Greetings': t('lessons.basicGreetings.title', 'Basic Greetings'),
      'Learn essential greetings and polite expressions': t('lessons.basicGreetings.description', 'Learn essential greetings and polite expressions'),
      'Numbers and Time': t('lessons.numbersAndTime.title', 'Numbers and Time'),
      'Master numbers, time expressions, and basic counting': t('lessons.numbersAndTime.description', 'Master numbers, time expressions, and basic counting'),
      'Family and Relationships': t('lessons.familyAndRelationships.title', 'Family and Relationships'),
      'Learn family members and relationship vocabulary': t('lessons.familyAndRelationships.description', 'Learn family members and relationship vocabulary'),
      'Food and Drinks': t('lessons.foodAndDrinks.title', 'Food and Drinks'),
      'Learn to talk about food, drinks and preferences': t('lessons.foodAndDrinks.description', 'Learn to talk about food, drinks and preferences'),
      'Past Simple - Regular Verbs': t('lessons.pastSimple.title', 'Past Simple - Regular Verbs'),
      'Learn to describe actions that happened in the past': t('lessons.pastSimple.description', 'Learn to describe actions that happened in the past'),
      'Present Perfect': t('lessons.presentPerfect.title', 'Present Perfect'),
      'Learn to talk about experiences and recent past': t('lessons.presentPerfect.description', 'Learn to talk about experiences and recent past')
    };

    return {
      ...lessonData,
      title: lessonTranslations[lessonData.title] || lessonData.title,
      description: lessonTranslations[lessonData.description] || lessonData.description
    };
  };

  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCards: 0,
    newCards: 0,
    reviewCards: 0,
    masteredCards: 0
  });

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user, lessonId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      // Get backend user
      const userData = await apiService.getUserByFirebaseUid(user.uid);

      // Load lesson
      const lessonData = await apiService.getEnglishLesson(lessonId);
      setLesson(translateLessonData(lessonData));

      // Load progress
      const progressData = await apiService.getLessonProgress(userData.id, lessonId);
      setProgress(progressData);

      // Load lesson questions for stats (without userId to get all questions)
      const questions = await apiService.getQuestionsByLesson(lessonId);
      
      setStats({
        totalCards: questions.length,
        newCards: questions.filter(q => !q.isDue).length,
        reviewCards: questions.filter(q => q.isDue).length,
        masteredCards: Math.floor(questions.length * (progressData.accuracyPercentage / 100))
      });

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (percentage) => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 70) return 'text-yellow-500';
    if (percentage >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getAccuracyBadge = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '🎉';
      case 'in_progress':
        return '📚';
      case 'not_started':
        return '⏳';
      default:
        return '📖';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'not_started':
        return 'bg-gray-500';
      default:
        return 'bg-purple-500';
    }
  };


  if (loading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
              <p className="text-copilot-text-secondary">{t('progress.loading', 'Loading progress...')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !progress) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-yellow-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-3">
              {t('progress.dataNotAvailable', 'Progress data not available')}
            </h2>
            <p className="text-copilot-text-secondary mb-6">
              {t('progress.dataNotAvailableDescription', 'We couldn\'t load your progress data. Please try again.')}
            </p>
            <button
              className="btn-copilot-primary"
              onClick={() => navigate('/english-course')}
            >
              ← {t('progress.backToDashboard', 'Back to Dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              className="btn-copilot-secondary flex items-center gap-2"
              onClick={() => navigate('/english-course')}
            >
              <span>←</span>
              <span>{t('progress.backToDashboard', 'Back to Dashboard')}</span>
            </button>
            <div className="h-8 w-px bg-copilot-border-default"></div>
            <div>
              <h1 className="text-2xl font-bold text-copilot-text-primary">
                {t('progress.title', 'Lesson Progress')}
              </h1>
              <p className="text-copilot-text-secondary">
                {t('progress.subtitle', 'Track your learning journey')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getAccuracyBadge(progress.accuracyPercentage)}`}>
              {progress.accuracyPercentage}% {t('progress.accuracy', 'Accuracy')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(progress.status)}`}>
              {progress.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Overview */}
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 min-h-[400px]">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-copilot flex items-center justify-center text-white text-2xl">
                    {getStatusIcon(progress.status)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-copilot-text-primary mb-1">
                      {lesson.title}
                    </h2>
                    <p className="text-copilot-text-secondary text-sm">
                      {lesson.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                      </span>
                      <span className="text-copilot-text-secondary text-xs">
                        Lesson {lesson.lessonNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-copilot-bg-primary rounded-copilot border border-copilot-border-default h-20 flex flex-col justify-center">
                  <div className={`text-3xl font-bold mb-1 ${getAccuracyColor(progress.accuracyPercentage)}`}>
                    {progress.accuracyPercentage}%
                  </div>
                  <div className="text-sm text-copilot-text-secondary">{t('progress.accuracy', 'Accuracy')}</div>
                </div>
                <div className="text-center p-4 bg-copilot-bg-primary rounded-copilot border border-copilot-border-default h-20 flex flex-col justify-center">
                  <div className="text-3xl font-bold text-green-500 mb-1">
                    {progress.correctAnswers}
                  </div>
                  <div className="text-sm text-copilot-text-secondary">{t('progress.correct', 'Correct')}</div>
                </div>
                <div className="text-center p-4 bg-copilot-bg-primary rounded-copilot border border-copilot-border-default h-20 flex flex-col justify-center">
                  <div className="text-3xl font-bold text-blue-500 mb-1">
                    {progress.totalAttempts}
                  </div>
                  <div className="text-sm text-copilot-text-secondary">{t('progress.totalAttempts', 'Total Attempts')}</div>
                </div>
                <div className="text-center p-4 bg-copilot-bg-primary rounded-copilot border border-copilot-border-default h-20 flex flex-col justify-center">
                  <div className="text-3xl font-bold text-purple-500 mb-1">
                    {stats.totalCards}
                  </div>
                  <div className="text-sm text-copilot-text-secondary">{t('progress.totalCards', 'Total Cards')}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-copilot-text-primary">{t('progress.overallProgress', 'Overall Progress')}</span>
                  <span className="text-sm text-copilot-text-secondary">
                    {stats.totalCards > 0 ? Math.round((progress.correctAnswers / stats.totalCards) * 100) : 0}% {t('progress.complete', 'Complete')}
                  </span>
                </div>
                <div className="w-full bg-copilot-border-default rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalCards > 0 ? Math.min((progress.correctAnswers / stats.totalCards) * 100, 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  className="btn-copilot-primary flex items-center gap-2"
                  onClick={() => navigate(`/english-course/practice/${lessonId}`)}
                >
                  <span>🔄</span>
                  <span>{t('progress.practiceAgain', 'Practice Again')}</span>
                </button>
                <button
                  className="btn-copilot-secondary flex items-center gap-2"
                  onClick={() => navigate('/english-course/review')}
                >
                  <span>📚</span>
                  <span>{t('progress.reviewAll', 'Review All')}</span>
                </button>
                <button
                  className="btn-copilot-outline flex items-center gap-2"
                  onClick={() => navigate('/english-course')}
                >
                  <span>🏠</span>
                  <span>{t('progress.dashboard', 'Dashboard')}</span>
                </button>
              </div>
            </div>

            {/* Card Statistics */}
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 min-h-[350px] flex flex-col">
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-6">
                {t('progress.cardStatistics', 'Card Statistics')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-copilot border border-green-200 h-24 flex flex-col justify-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {stats.masteredCards}
                  </div>
                  <div className="text-sm text-green-700">{t('progress.mastered', 'Mastered')}</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-copilot border border-blue-200 h-24 flex flex-col justify-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {stats.reviewCards}
                  </div>
                  <div className="text-sm text-blue-700">{t('progress.dueForReview', 'Due for Review')}</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-copilot border border-yellow-200 h-24 flex flex-col justify-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {stats.newCards}
                  </div>
                  <div className="text-sm text-yellow-700">{t('progress.newCards', 'New Cards')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-copilot border border-gray-200 h-24 flex flex-col justify-center">
                  <div className="text-2xl font-bold text-gray-600 mb-1">
                    {stats.totalCards - progress.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-700">{t('progress.remaining', 'Remaining')}</div>
                </div>
              </div>
              {/* Espaçador para alinhar com Quick Actions */}
              <div className="flex-1"></div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Details */}
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                {t('progress.lessonDetails', 'Lesson Details')}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-copilot-text-primary mb-1">{t('progress.level', 'Level')}</div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                  </span>
                </div>

                {lesson.grammarFocus && (
                  <div>
                    <div className="text-sm font-medium text-copilot-text-primary mb-2">{t('progress.grammarFocus', 'Grammar Focus')}</div>
                    <p className="text-sm text-copilot-text-secondary">{lesson.grammarFocus}</p>
                  </div>
                )}

                {lesson.vocabularyFocus && lesson.vocabularyFocus.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-copilot-text-primary mb-2">{t('progress.vocabulary', 'Vocabulary')}</div>
                    <div className="flex flex-wrap gap-1">
                      {lesson.vocabularyFocus.map((word, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                {t('progress.progressTimeline', 'Progress Timeline')}
              </h3>
              <div className="space-y-4">
                {progress.lastPracticedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-copilot-text-primary">{t('progress.lastPracticed', 'Last Practiced')}</div>
                      <div className="text-xs text-copilot-text-secondary">
                        {new Date(progress.lastPracticedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {progress.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-copilot-text-primary">{t('progress.completed', 'Completed')}</div>
                      <div className="text-xs text-copilot-text-secondary">
                        {new Date(progress.completedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-copilot-text-primary">{t('progress.started', 'Started')}</div>
                    <div className="text-xs text-copilot-text-secondary">
                      {new Date(progress.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                {t('progress.quickActions', 'Quick Actions')}
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full btn-copilot-outline text-left flex items-center gap-3"
                  onClick={() => navigate(`/english-course/practice/${lessonId}`)}
                >
                  <span>🔄</span>
                  <span>{t('progress.practiceAgain', 'Practice Again')}</span>
                </button>
                <button
                  className="w-full btn-copilot-outline text-left flex items-center gap-3"
                  onClick={() => navigate('/english-course/review')}
                >
                  <span>📚</span>
                  <span>{t('progress.reviewAllLessons', 'Review All Lessons')}</span>
                </button>
                <button
                  className="w-full btn-copilot-outline text-left flex items-center gap-3"
                  onClick={() => navigate('/english-course')}
                >
                  <span>🏠</span>
                  <span>{t('progress.backToDashboard', 'Back to Dashboard')}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;