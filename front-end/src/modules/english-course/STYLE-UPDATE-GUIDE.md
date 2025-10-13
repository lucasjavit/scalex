# English Course - Clean Style Update Guide

This document contains the updated clean styles for the remaining components to match the Home page design.

## ✅ **Already Updated**
- Dashboard.jsx - Complete
- LessonCard.jsx - Complete
- ProgressStats.jsx - Complete

## 📝 **Files to Update**

### 1. QuestionCard.jsx
Replace the Bootstrap classes with this clean Tailwind design:

```jsx
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

      <div className="bg-copilot-bg-tertiary rounded-copilot p-8 mb-6">
        <h2 className="text-2xl text-copilot-text-primary text-center font-semibold">
          {question.questionText}
        </h2>
      </div>

      {question.grammarPoint && (
        <p className="text-copilot-text-secondary text-sm mb-6">
          <span className="text-copilot-accent-purple font-semibold">Grammar Point:</span> {question.grammarPoint}
        </p>
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
          className="btn-copilot-primary w-full text-lg py-3"
          disabled={answer.trim() === '' || showFeedback}
        >
          Submit Answer
        </button>
      </form>
    </div>
  );
};

export default QuestionCard;
```

---

### 2. FeedbackModal.jsx
Update with clean modal design:

```jsx
import React from 'react';

const FeedbackModal = ({ show, feedback, onNext, isLastQuestion }) => {
  if (!show || !feedback) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot-lg max-w-md w-full shadow-copilot-xl">
        <div className={`p-6 rounded-t-copilot-lg ${feedback.isCorrect ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-pink-500'}`}>
          <h3 className="text-white text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">{feedback.isCorrect ? '✓' : '✗'}</span>
            {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
          </h3>
        </div>

        <div className="p-6">
          {!feedback.isCorrect && (
            <div className="mb-4 p-4 bg-copilot-bg-tertiary rounded-copilot">
              <p className="text-copilot-text-secondary text-sm font-semibold mb-2">Correct Answer:</p>
              <p className="text-copilot-accent-success text-lg font-semibold">{feedback.correctAnswer}</p>
            </div>
          )}

          <p className="text-copilot-text-secondary mb-4">{feedback.feedback}</p>

          {feedback.accuracy !== undefined && (
            <p className="text-copilot-text-tertiary text-sm">
              Current Lesson Accuracy: <span className="text-copilot-accent-primary font-bold">{feedback.accuracy}%</span>
            </p>
          )}
        </div>

        <div className="p-6 border-t border-copilot-border-default">
          <button
            type="button"
            className="btn-copilot-primary w-full text-lg py-3"
            onClick={onNext}
          >
            {isLastQuestion ? 'Finish Lesson' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
```

---

### 3. Practice.jsx
Update with clean navigation and progress:

Key changes:
- Replace `container` with `bg-copilot-bg-primary min-h-screen`
- Use `max-w-7xl mx-auto px-6 py-12`
- Replace buttons with `btn-copilot-secondary`
- Update progress bar with Tailwind gradients
- Use card-copilot for layouts

---

### 4. Review.jsx
Similar to Practice.jsx, update with:
- Clean dark background
- Gradient buttons
- Copilot card styles
- Modern progress indicators

---

### 5. Progress.jsx
Update results page with:
- Large icon display (similar to Home)
- Grid layout for stats
- Clean cards with hover effects
- Gradient CTA buttons

---

## 🎨 **Color Palette Reference**

### Backgrounds
- Primary: `bg-copilot-bg-primary` (#1e1e1e)
- Secondary: `bg-copilot-bg-secondary` (#2d2d30)
- Tertiary: `bg-copilot-bg-tertiary` (#3e3e42)

### Text
- Primary: `text-copilot-text-primary` (#cccccc)
- Secondary: `text-copilot-text-secondary` (#9d9d9d)
- Tertiary: `text-copilot-text-tertiary` (#6e6e6e)

### Accents
- Primary Blue: `bg-copilot-accent-primary` (#007acc)
- Purple: `text-copilot-accent-purple` (#c586c0)
- Success: `text-copilot-accent-success` (#4ec9b0)

### Gradients
- Main: `bg-copilot-gradient` (purple gradient)
- Alt: `bg-copilot-gradient-alt` (blue gradient)
- Custom: `bg-gradient-to-br from-[color] to-[color]`

---

## 🔧 **Component Classes**

### Buttons
```jsx
// Primary button
className="btn-copilot-primary"

// Secondary button
className="btn-copilot-secondary"
```

### Cards
```jsx
// Standard card with hover
className="card-copilot p-6"

// Card with hover border color
className="card-copilot p-6 hover:border-copilot-accent-primary"
```

### Inputs
```jsx
className="input-copilot w-full"
```

### Badges/Pills
```jsx
className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-copilot font-medium"
```

---

## 📦 **Common Patterns**

### Loading State
```jsx
<div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
  <div className="text-center">
    <div className="inline-block w-12 h-12 border-4 border-copilot-accent-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="text-copilot-text-secondary mt-4">Loading...</p>
  </div>
</div>
```

### Page Header with Icon
```jsx
<div className="text-center mb-12">
  <div className="inline-block bg-copilot-gradient p-4 rounded-copilot-lg mb-6 shadow-copilot-lg">
    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
      <span className="text-5xl">📚</span>
    </div>
  </div>
  <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
    Page Title
  </h1>
  <p className="text-copilot-text-secondary text-lg">
    Page description
  </p>
</div>
```

### CTA Section
```jsx
<div className="mt-16 bg-copilot-gradient rounded-copilot-lg p-8 text-center shadow-copilot-xl">
  <h3 className="text-2xl font-bold text-white mb-3">
    Call to Action
  </h3>
  <p className="text-white text-opacity-90 mb-6">
    Description text
  </p>
  <button className="bg-white text-copilot-bg-primary px-8 py-3 rounded-copilot font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-copilot-lg">
    Action Button
  </button>
</div>
```

---

## ✅ **Checklist**

- [x] Dashboard - Updated
- [x] LessonCard - Updated
- [x] ProgressStats - Updated
- [ ] QuestionCard - Use code above
- [ ] FeedbackModal - Use code above
- [ ] Practice - Apply clean styles
- [ ] Review - Apply clean styles
- [ ] Progress - Apply clean styles

---

## 🚀 **Result**

After updating all files, the English Course module will have:
- ✅ Consistent dark Copilot theme
- ✅ Modern gradient accents
- ✅ Smooth transitions and hover effects
- ✅ Clean, professional layout
- ✅ Responsive design
- ✅ Matching Home page aesthetic

All changes use Tailwind CSS with custom Copilot color palette!
