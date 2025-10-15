import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../../services/api';
import { useAuth } from '../../auth-social/context/AuthContext';
import ProgressStats from '../components/ProgressStats';

const Dashboard = () => {
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

      // Always load all lessons for grouping by level
      const lessonsData = await apiService.getEnglishLessons();
      setLessons(lessonsData);

      const progressData = await apiService.getUserProgress(backendUser.id);
      setProgress(progressData);

      const statsData = await apiService.getUserStatistics(backendUser.id);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressForLesson = (lessonId) => {
    return progress.find((p) => p.lessonId === lessonId);
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
    const completed = levelLessons.filter(lesson => {
      const prog = getProgressForLesson(lesson.id);
      return prog?.status === 'completed';
    }).length;
    return Math.round((completed / levelLessons.length) * 100);
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
      return !prog || prog.status === 'not_started';
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
          <p className="text-copilot-text-secondary mt-4">Loading...</p>
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
            <span>Back to Home</span>
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
            English Course
          </h1>

          <p className="text-copilot-text-secondary text-lg mb-6">
            Practice with our intelligent revision system
          </p>

          {statistics?.dueReviews > 0 && (
            <Link
              to="/english-course/review"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-copilot font-semibold hover:opacity-90 transition-all duration-200 shadow-copilot-lg"
            >
              <span>⚡</span>
              Review {statistics.dueReviews} Questions
            </Link>
          )}
        </div>

        {/* Statistics */}
        <ProgressStats statistics={statistics} />

        {/* Lesson Decks by Level */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-8">
            Lesson Decks
          </h2>

          {lessons.length === 0 ? (
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
              <span className="text-5xl mb-4 block">📭</span>
              <p className="text-copilot-text-secondary">
                No lessons available yet.
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
                        Beginner
                      </h3>
                      <p className="text-copilot-text-secondary text-sm mb-4">
                        Start your English learning journey with basic concepts
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">Lessons</span>
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
                          <span className="text-copilot-text-tertiary">Progress</span>
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
                        Elementary
                      </h3>
                      <p className="text-copilot-text-secondary text-sm mb-4">
                        Build your foundation with essential grammar and vocabulary
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">Lessons</span>
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
                          <span className="text-copilot-text-tertiary">Progress</span>
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
                        Intermediate
                      </h3>
                      <p className="text-copilot-text-secondary text-sm mb-4">
                        Advance your skills with complex structures and expressions
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">Lessons</span>
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
                          <span className="text-copilot-text-tertiary">Progress</span>
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
                        Advanced
                      </h3>
                      <p className="text-copilot-text-secondary text-sm mb-4">
                        Master advanced concepts and achieve fluency
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-copilot-text-tertiary">Lessons</span>
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
                          <span className="text-copilot-text-tertiary">Progress</span>
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
            Ready to improve your English?
          </h3>
          <p className="text-white text-opacity-90 mb-6">
            Practice daily with our interactive method for fast results
          </p>
          {lessons.length > 0 && (
            <Link
              to={`/english-course/practice/${lessons[0].id}`}
              className="inline-block bg-white text-copilot-bg-primary px-8 py-3 rounded-copilot font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-copilot-lg"
            >
              Start Practicing Now
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
