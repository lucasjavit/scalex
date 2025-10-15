import React from 'react';
import { useTranslation } from 'react-i18next';

const ProgressStats = ({ statistics }) => {
  const { t } = useTranslation('englishCourse');
  if (!statistics) {
    return null;
  }

  const stats = [
    {
      icon: '📊',
      label: t('stats.overallProgress'),
      value: `${statistics.progressPercentage}%`,
      subtitle: t('stats.lessonsCompleted', { completed: statistics.completedLessons, total: statistics.totalLessons }),
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: '✓',
      label: t('stats.overallAccuracy'),
      value: `${statistics.overallAccuracy}%`,
      subtitle: t('stats.correctAnswers', { correct: statistics.totalCorrect, total: statistics.totalAttempts }),
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: '📖',
      label: t('stats.inProgress'),
      value: statistics.inProgressLessons,
      subtitle: t('stats.lessonsStarted'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '⚡',
      label: t('stats.dueReviews'),
      value: statistics.dueReviews,
      subtitle: t('stats.questionsToReview'),
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="card-copilot p-6 text-center hover:border-copilot-accent-primary">
          <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-copilot flex items-center justify-center mb-4 shadow-copilot mx-auto`}>
            <span className="text-white text-2xl">{stat.icon}</span>
          </div>
          <h3 className="text-copilot-text-secondary text-sm mb-2">{stat.label}</h3>
          <h2 className="text-copilot-text-primary text-3xl font-bold mb-1">{stat.value}</h2>
          <p className="text-copilot-text-tertiary text-xs">{stat.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default ProgressStats;
