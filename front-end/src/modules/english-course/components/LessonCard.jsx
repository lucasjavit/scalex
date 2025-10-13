import React from 'react';
import { Link } from 'react-router-dom';

const LessonCard = ({ lesson, progress }) => {
  const getStatusBadge = () => {
    const statusStyles = {
      completed: 'bg-gradient-to-br from-green-500 to-emerald-500',
      in_progress: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      needs_review: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      not_started: 'bg-copilot-bg-tertiary',
    };

    const status = progress?.status || 'not_started';
    const label = status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
      <span className={`${statusStyles[status]} text-white text-xs px-3 py-1 rounded-copilot font-medium`}>
        {label}
      </span>
    );
  };

  const getLevelBadge = () => {
    const levelStyles = {
      beginner: 'bg-gradient-to-br from-green-500 to-emerald-500',
      elementary: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      intermediate: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      advanced: 'bg-gradient-to-br from-red-500 to-pink-500',
    };

    return (
      <span className={`${levelStyles[lesson.level]} text-white text-xs px-3 py-1 rounded-copilot font-medium`}>
        {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
      </span>
    );
  };

  return (
    <div className="card-copilot p-6 h-full flex flex-col hover:border-copilot-accent-primary">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-copilot-text-primary flex-1">
          Lesson {lesson.lessonNumber}: {lesson.title}
        </h3>
        {getLevelBadge()}
      </div>

      <p className="text-copilot-text-secondary text-sm mb-4">{lesson.description}</p>

      {lesson.grammarFocus && (
        <p className="text-sm mb-3">
          <span className="text-copilot-accent-purple font-semibold">Grammar:</span>{' '}
          <span className="text-copilot-text-secondary">{lesson.grammarFocus}</span>
        </p>
      )}

      {lesson.vocabularyFocus && lesson.vocabularyFocus.length > 0 && (
        <div className="mb-4">
          <span className="text-copilot-accent-blue font-semibold text-sm">Vocabulary:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {lesson.vocabularyFocus.slice(0, 5).map((word, idx) => (
              <span key={idx} className="bg-copilot-bg-tertiary text-copilot-text-secondary text-xs px-2 py-1 rounded">
                {word}
              </span>
            ))}
            {lesson.vocabularyFocus.length > 5 && (
              <span className="bg-copilot-bg-tertiary text-copilot-text-secondary text-xs px-2 py-1 rounded">
                +{lesson.vocabularyFocus.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {progress && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-copilot-text-secondary mb-2">
            <span>Accuracy: {progress.accuracyPercentage}%</span>
            <span>{progress.correctAnswers}/{progress.totalAttempts} correct</span>
          </div>
          <div className="w-full bg-copilot-bg-tertiary rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${progress.accuracyPercentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}`}
              style={{ width: `${progress.accuracyPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-copilot-border-default flex justify-between items-center">
        {getStatusBadge()}
        <Link
          to={`/english-course/practice/${lesson.id}`}
          className="btn-copilot-primary text-sm"
        >
          {progress?.status === 'completed' ? 'Review' : 'Start Practice'}
        </Link>
      </div>
    </div>
  );
};

export default LessonCard;
