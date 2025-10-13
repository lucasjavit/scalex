import React from 'react';

const ProgressStats = ({ statistics }) => {
  if (!statistics) {
    return null;
  }

  const stats = [
    {
      icon: '📊',
      label: 'Overall Progress',
      value: `${statistics.progressPercentage}%`,
      subtitle: `${statistics.completedLessons}/${statistics.totalLessons} lessons completed`,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: '✓',
      label: 'Overall Accuracy',
      value: `${statistics.overallAccuracy}%`,
      subtitle: `${statistics.totalCorrect}/${statistics.totalAttempts} correct answers`,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: '📖',
      label: 'In Progress',
      value: statistics.inProgressLessons,
      subtitle: 'lessons started',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '⚡',
      label: 'Due Reviews',
      value: statistics.dueReviews,
      subtitle: 'questions to review',
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
