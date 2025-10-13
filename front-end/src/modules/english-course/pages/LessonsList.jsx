import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import LessonCard from '../components/LessonCard';

const LessonsList = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLessons();
  }, [level]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await api.getEnglishLessons();
      const filteredLessons = response.filter(
        (lesson) => lesson.level.toLowerCase() === level.toLowerCase()
      );
      setLessons(filteredLessons);
      setError(null);
    } catch (err) {
      setError('Failed to load lessons');
      console.error('Error loading lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const levelInfo = {
    beginner: {
      icon: '🌱',
      title: 'Beginner',
      description: 'Start your English learning journey with basic vocabulary and grammar',
      gradient: 'from-green-500 to-emerald-500'
    },
    elementary: {
      icon: '📘',
      title: 'Elementary',
      description: 'Build on your foundation with more complex sentences and conversations',
      gradient: 'from-blue-500 to-cyan-500'
    },
    intermediate: {
      icon: '🔥',
      title: 'Intermediate',
      description: 'Master advanced grammar and expand your vocabulary significantly',
      gradient: 'from-yellow-500 to-orange-500'
    },
    advanced: {
      icon: '🚀',
      title: 'Advanced',
      description: 'Perfect your English with complex topics and native-level fluency',
      gradient: 'from-red-500 to-pink-500'
    }
  };

  const currentLevel = levelInfo[level.toLowerCase()] || levelInfo.beginner;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4ff] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
        <div className="card-copilot p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadLessons}
            className="btn-copilot"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/english-course')}
            className="text-[#00d4ff] hover:text-[#00a8cc] mb-4 flex items-center gap-2 transition-colors"
          >
            <span>←</span> Back to Dashboard
          </button>

          <div className="card-copilot p-6">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 bg-gradient-to-br ${currentLevel.gradient} rounded-xl flex items-center justify-center text-4xl shadow-lg`}>
                {currentLevel.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{currentLevel.title} Lessons</h1>
                <p className="text-gray-400">{currentLevel.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} available
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        {lessons.length === 0 ? (
          <div className="card-copilot p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No lessons available yet</h3>
            <p className="text-gray-400">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsList;
