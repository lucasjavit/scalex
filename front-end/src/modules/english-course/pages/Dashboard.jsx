import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../../services/api';
import { useAuth } from '../../auth-social/context/AuthContext';
import ProgressStats from '../components/ProgressStats';

const Dashboard = () => {
  const { t } = useTranslation(['englishCourse', 'common']);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedLevel]);

  const loadData = async () => {
    try {
      setLoading(true);

      const backendUser = await apiService.getUserByFirebaseUid(user.uid);

      // Load lessons with access validation
      const lessonsData = await apiService.getEnglishLessons(null, backendUser.id);
      setLessons(lessonsData);

      const progressData = await apiService.getUserProgress(backendUser.id);
      setProgress(progressData);

      const statsData = await apiService.getUserStatistics(backendUser.id);
      setStatistics(statsData);
      
      // Debug logs
      console.log('📊 Dashboard data loaded:');
      console.log('Lessons:', lessonsData);
      console.log('Progress:', progressData);
      console.log('Statistics:', statsData);
      console.log('Grouped lessons:', {
        beginner: lessonsData.filter(l => l.level === 'beginner'),
        elementary: lessonsData.filter(l => l.level === 'elementary'),
        intermediate: lessonsData.filter(l => l.level === 'intermediate'),
        advanced: lessonsData.filter(l => l.level === 'advanced'),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressForLesson = (lessonId) => {
    const lessonProgress = progress.find((p) => p.lessonId === lessonId);
    console.log(`🔍 Looking for progress for lesson ${lessonId}:`, lessonProgress);
    return lessonProgress;
  };

  const getLessonStatus = (lesson) => {
    const lessonProgress = getProgressForLesson(lesson.id);
    
    if (!lesson.isAccessible) {
      return { status: 'locked', text: 'Locked', color: 'bg-gray-500' };
    }
    
    if (lessonProgress?.status === 'completed') {
      return { status: 'completed', text: 'Completed', color: 'bg-green-500' };
    }
    
    if (lessonProgress?.status === 'in_progress') {
      return { status: 'in_progress', text: 'In Progress', color: 'bg-yellow-500' };
    }
    
    return { status: 'available', text: 'Available', color: 'bg-blue-500' };
  };

  // Group lessons by level
  const groupedLessons = {
    beginner: lessons.filter(l => l.level === 'beginner'),
    elementary: lessons.filter(l => l.level === 'elementary'),
    intermediate: lessons.filter(l => l.level === 'intermediate'),
    advanced: lessons.filter(l => l.level === 'advanced'),
  };


  // Calculate progress for each level deck
  const getDeckProgress = (levelLessons) => {
    if (levelLessons.length === 0) return 0;
    
    console.log(`📈 Calculating progress for ${levelLessons[0]?.level || 'unknown'} level:`, levelLessons);
    
    let totalProgress = 0;
    
    levelLessons.forEach(lesson => {
      const prog = getProgressForLesson(lesson.id);
      let lessonProgress = 0;
      
      if (prog?.status === 'completed') {
        lessonProgress = 100;
      } else if (prog?.status === 'in_progress') {
        lessonProgress = 50;
      } else {
        lessonProgress = 0;
      }
      
      console.log(`  - Lesson ${lesson.title} (${lesson.id}): status=${prog?.status}, progress=${lessonProgress}%`);
      totalProgress += lessonProgress;
    });
    
    const averageProgress = Math.round(totalProgress / levelLessons.length);
    console.log(`📈 Deck progress calculation:`, {
      level: levelLessons[0]?.level || 'unknown',
      totalLessons: levelLessons.length,
      totalProgress: totalProgress,
      averageProgress: `${averageProgress}%`
    });
    return averageProgress;
  };

  // Get the first available lesson for a level (not completed or in progress)
  const getFirstAvailableLesson = (levelLessons) => {
    // First try to find a lesson in progress
    const inProgress = levelLessons.find(lesson => {
      const prog = getProgressForLesson(lesson.id);
      return prog?.status === 'in_progress';
    });
    if (inProgress) return inProgress;

    // Then try to find a not started lesson
    const notStarted = levelLessons.find(lesson => {
      const prog = getProgressForLesson(lesson.id);
      return lesson.isAccessible && (!prog || prog.status === 'not_started');
    });
    if (notStarted) return notStarted;

    // If all are completed, return the first one
    return levelLessons[0];
  };

  const handleDeckClick = (levelLessons) => (e) => {
    e.preventDefault();
    const lesson = getFirstAvailableLesson(levelLessons);
    if (lesson) {
      navigate(`/english-course/practice/${lesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-copilot-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-copilot-text-secondary mt-4">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/home')}
            className="btn-copilot-secondary flex items-center gap-2"
          >
            <span>←</span>
            <span>{t('common:navigation.backToHome')}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-copilot-gradient p-4 rounded-copilot-lg mb-6 shadow-copilot-lg">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-5xl">📚</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
            {t('dashboard.title')}
          </h1>

          <p className="text-copilot-text-secondary text-lg mb-6">
            {t('dashboard.subtitle')}
          </p>

          {/* How It Works Link */}
          <div className="flex justify-center gap-4 mb-6">
            <Link
              to="/english-course/how-it-works"
              className="inline-flex items-center gap-2 px-4 py-2 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot text-copilot-text-primary hover:bg-copilot-bg-tertiary transition-colors"
            >
              <span>ℹ️</span>
              {t('dashboard.howItWorks', 'Como Funciona')}
            </Link>
          </div>

        </div>

        {/* Overall Progress Bar */}
        {statistics && (
          <div className="mb-8">
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-copilot-text-primary mb-1">
                    Overall Course Progress
                  </h3>
                  <p className="text-copilot-text-secondary text-sm">
                    {statistics.completedLessons} of {statistics.totalLessons} lessons completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-copilot-accent-primary">
                    {statistics.progressPercentage}%
                  </div>
                  <div className="text-sm text-copilot-text-secondary">
                    Complete
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-copilot-bg-tertiary rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                  style={{ width: `${statistics.progressPercentage}%` }}
                ></div>
              </div>
              
              {/* Progress Details */}
              <div className="flex justify-between items-center mt-4 text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-copilot-text-secondary">Completed: {statistics.completedLessons}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-copilot-text-secondary">In Progress: {statistics.inProgressLessons}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-copilot-text-secondary">Not Started: {statistics.totalLessons - statistics.completedLessons - statistics.inProgressLessons}</span>
                  </div>
                </div>
                <div className="text-copilot-text-primary font-semibold">
                  {statistics.overallAccuracy}% Accuracy
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <ProgressStats statistics={statistics} />

        {/* Review Button */}
        <div className="mt-8 text-center">
          <Link
            to="/english-course/review"
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-copilot text-lg font-bold transition-all duration-200 shadow-copilot-xl ${
              statistics?.dueReviews > 0
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white hover:opacity-90 cursor-pointer hover:scale-105'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
            }`}
            onClick={(e) => {
              if (statistics?.dueReviews === 0) {
                e.preventDefault();
              }
            }}
          >
            <span className="text-2xl">⚡</span>
            {statistics?.dueReviews > 0 
              ? t('dashboard.reviewQuestions', { count: statistics.dueReviews })
              : t('dashboard.noReviewsAvailable', 'No reviews available')
            }
          </Link>
        </div>

        {/* Lesson Decks by Level */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-8">
            {t('dashboard.lessonDecks')}
          </h2>

          {lessons.length === 0 ? (
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
              <span className="text-5xl mb-4 block">📭</span>
              <p className="text-copilot-text-secondary">
                {t('dashboard.noLessonsAvailable')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Beginner Deck */}
              {groupedLessons.beginner.length > 0 && (
                <div
                  onClick={handleDeckClick(groupedLessons.beginner)}
                  className="card-copilot p-8 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-copilot-lg flex items-center justify-center shadow-copilot flex-shrink-0">
                      <span className="text-white text-3xl">🌱</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-copilot-text-primary mb-2">
                        {t('dashboard.levels.beginner')}
                      </h3>
                      <p className="text-copilot-text-secondary text-sm mb-4">
                        {t('dashboard.levels.beginnerDescription')}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">{t('dashboard.lessons')}</span>
                          <span className="text-copilot-text-primary font-semibold">
                            {groupedLessons.beginner.length}
                          </span>
                        </div>
                        <div className="w-full bg-copilot-bg-tertiary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${getDeckProgress(groupedLessons.beginner)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">{t('dashboard.progressPercentage')}</span>
                          <span className="text-copilot-accent-success font-semibold">
                            {getDeckProgress(groupedLessons.beginner)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Elementary Deck */}
              {groupedLessons.elementary.length > 0 && (
                <div
                  onClick={handleDeckClick(groupedLessons.elementary)}
                  className="card-copilot p-8 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-copilot-lg flex items-center justify-center shadow-copilot flex-shrink-0">
                      <span className="text-white text-3xl">📘</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-copilot-text-primary mb-2">
                        {t('dashboard.levels.elementary')}
                      </h3>
                      <p className="text-copilot-text-secondary text-sm mb-4">
                        {t('dashboard.levels.elementaryDescription')}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">{t('dashboard.lessons')}</span>
                          <span className="text-copilot-text-primary font-semibold">
                            {groupedLessons.elementary.length}
                          </span>
                        </div>
                        <div className="w-full bg-copilot-bg-tertiary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{ width: `${getDeckProgress(groupedLessons.elementary)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">{t('dashboard.progressPercentage')}</span>
                          <span className="text-copilot-accent-blue font-semibold">
                            {getDeckProgress(groupedLessons.elementary)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Intermediate Deck */}
              {groupedLessons.intermediate.length > 0 && (
                <div
                  onClick={handleDeckClick(groupedLessons.intermediate)}
                  className="card-copilot p-8 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-copilot-lg flex items-center justify-center shadow-copilot flex-shrink-0">
                      <span className="text-white text-3xl">🔥</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-copilot-text-primary mb-2">
                        {t('dashboard.levels.intermediate')}
                      </h3>
                      <p className="text-copilot-text-secondary text-sm mb-4">
                        {t('dashboard.levels.intermediateDescription')}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">{t('dashboard.lessons')}</span>
                          <span className="text-copilot-text-primary font-semibold">
                            {groupedLessons.intermediate.length}
                          </span>
                        </div>
                        <div className="w-full bg-copilot-bg-tertiary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                            style={{ width: `${getDeckProgress(groupedLessons.intermediate)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">{t('dashboard.progressPercentage')}</span>
                          <span className="text-copilot-accent-warning font-semibold">
                            {getDeckProgress(groupedLessons.intermediate)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Deck */}
              {groupedLessons.advanced.length > 0 && (
                <div
                  onClick={handleDeckClick(groupedLessons.advanced)}
                  className="card-copilot p-8 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-copilot-lg flex items-center justify-center shadow-copilot flex-shrink-0">
                      <span className="text-white text-3xl">🚀</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-copilot-text-primary mb-2">
                        {t('dashboard.levels.advanced')}
                      </h3>
                      <p className="text-copilot-text-secondary text-sm mb-4">
                        {t('dashboard.levels.advancedDescription')}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">{t('dashboard.lessons')}</span>
                          <span className="text-copilot-text-primary font-semibold">
                            {groupedLessons.advanced.length}
                          </span>
                        </div>
                        <div className="w-full bg-copilot-bg-tertiary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                            style={{ width: `${getDeckProgress(groupedLessons.advanced)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">{t('dashboard.progressPercentage')}</span>
                          <span className="text-copilot-accent-error font-semibold">
                            {getDeckProgress(groupedLessons.advanced)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-copilot-gradient rounded-copilot-lg p-8 text-center shadow-copilot-xl">
          <h3 className="text-2xl font-bold text-white mb-3">
            {t('dashboard.readyToImprove')}
          </h3>
          <p className="text-white text-opacity-90 mb-6">
            {t('dashboard.practiceDaily')}
          </p>
          {lessons.length > 0 && (
            <Link
              to={`/english-course/practice/${lessons[0].id}`}
              className="inline-block bg-white text-copilot-bg-primary px-8 py-3 rounded-copilot font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-copilot-lg"
            >
{t('dashboard.startPracticingNow')}
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
