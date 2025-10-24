import React from 'react';

const FeedbackModal = ({ show, feedback, onDifficultySelect, isLastQuestion }) => {
  if (!show || !feedback) return null;

  const difficultyButtons = [
    {
      label: 'Again',
      value: 'again',
      description: '< 1 min',
      color: 'from-red-500 to-pink-500',
      textColor: 'text-red-400',
      borderColor: 'border-red-500'
    },
    {
      label: 'Hard',
      value: 'hard',
      description: '< 10 min',
      color: 'from-orange-500 to-yellow-500',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500'
    },
    {
      label: 'Good',
      value: 'good',
      description: '< 4 days',
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-400',
      borderColor: 'border-green-500'
    },
    {
      label: 'Easy',
      value: 'easy',
      description: '< 7 days',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot-lg max-w-md w-full shadow-copilot-xl animate-scale-in">
        {/* Header */}
        <div className={`p-6 rounded-t-copilot-lg ${
          feedback.isCorrect
            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
            : 'bg-gradient-to-br from-red-500 to-pink-500'
        }`}>
          <h3 className="text-white text-2xl font-bold flex items-center gap-3">
            <span className="text-4xl">{feedback.isCorrect ? '✓' : '✗'}</span>
            {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
          </h3>
        </div>

        {/* Body */}
        <div className="p-6">
          {!feedback.isCorrect && (
            <div className="mb-4 p-4 bg-copilot-bg-tertiary rounded-copilot border border-copilot-border-default">
              <p className="text-copilot-text-secondary text-sm font-semibold mb-2">
                Correct Answer:
              </p>
              <p className="text-copilot-accent-success text-lg font-semibold">
                {feedback.correctAnswer}
              </p>
            </div>
          )}

          <p className="text-copilot-text-secondary mb-4">{feedback.feedback}</p>

          {feedback.accuracy !== undefined && (
            <div className="p-3 bg-copilot-bg-primary rounded border border-copilot-border-subtle">
              <p className="text-copilot-text-tertiary text-sm">
                Current Lesson Accuracy:{' '}
                <span className="text-copilot-accent-primary font-bold text-base">
                  {feedback.accuracy}%
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Footer - Difficulty Buttons */}
        <div className="p-6 border-t border-copilot-border-default">
          <p className="text-copilot-text-secondary text-sm mb-4 text-center">
            How difficult was this question?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {difficultyButtons.map((btn) => (
              <button
                key={btn.value}
                type="button"
                className={`relative overflow-hidden group border-2 ${btn.borderColor} bg-copilot-bg-tertiary hover:bg-copilot-bg-primary rounded-copilot p-4 transition-all duration-200 hover:scale-105`}
                onClick={() => onDifficultySelect(btn.value)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${btn.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative">
                  <p className={`font-bold text-lg ${btn.textColor} mb-1`}>
                    {btn.label}
                  </p>
                  <p className="text-copilot-text-tertiary text-xs">
                    {btn.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
