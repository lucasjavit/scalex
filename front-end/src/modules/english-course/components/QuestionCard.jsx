import React, { useState, useEffect } from 'react';

const QuestionCard = ({ question, onSubmit, showFeedback }) => {
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    setStartTime(Date.now());
    setAnswer('');
  }, [question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() === '') return;

    const responseTime = Math.floor((Date.now() - startTime) / 1000);
    onSubmit({
      questionId: question.id,
      userAnswer: answer,
      responseTimeSeconds: responseTime,
    });
  };

  const difficultyStyles = {
    easy: 'bg-gradient-to-br from-green-500 to-emerald-500',
    medium: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    hard: 'bg-gradient-to-br from-red-500 to-pink-500',
  };

  return (
    <div className="card-copilot p-8 shadow-copilot-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-copilot-text-primary">
          Question {question.questionNumber}
        </h3>
        <span className={`${difficultyStyles[question.difficulty]} text-white text-xs px-3 py-1 rounded-copilot font-medium`}>
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
      </div>

      <div className="bg-copilot-bg-tertiary rounded-copilot p-8 mb-6 border border-copilot-border-default">
        <h2 className="text-2xl text-copilot-text-primary text-center font-semibold leading-relaxed">
          {question.questionText}
        </h2>
      </div>

      {question.grammarPoint && (
        <div className="mb-6 p-4 bg-copilot-bg-primary rounded-copilot border border-copilot-border-subtle">
          <p className="text-copilot-text-secondary text-sm">
            <span className="text-copilot-accent-purple font-semibold">Grammar Point:</span>{' '}
            {question.grammarPoint}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="answer" className="block text-copilot-text-secondary text-sm font-medium mb-2">
            Your Answer:
          </label>
          <input
            type="text"
            className="input-copilot w-full text-lg py-3"
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            autoFocus
            disabled={showFeedback}
          />
        </div>

        <button
          type="submit"
          className="btn-copilot-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={answer.trim() === '' || showFeedback}
        >
          Submit Answer →
        </button>
      </form>
    </div>
  );
};

export default QuestionCard;
