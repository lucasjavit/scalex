import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../../services/api';
import { useAuth } from '../../auth-social/context/AuthContext';
import FeedbackModal from '../components/FeedbackModal';
import QuestionCard from '../components/QuestionCard';

const Practice = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendUser, setBackendUser] = useState(null);

  useEffect(() => {
    if (user) {
      loadLessonData();
    }
  }, [user, lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);

      // Get backend user
      const userData = await apiService.getUserByFirebaseUid(user.uid);
      setBackendUser(userData);

      // Load lesson
      const lessonData = await apiService.getEnglishLesson(lessonId);
      setLesson(lessonData);

      // Load questions for this lesson
      const questionsData = await apiService.getQuestionsByLesson(lessonId);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (submitData) => {
    try {
      const result = await apiService.submitAnswer(backendUser.id, lessonId, submitData);
      setFeedback(result);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  const handleDifficultySelect = async (difficulty) => {
    try {
      // Submit the difficulty rating to update spaced repetition
      await apiService.submitDifficulty(
        backendUser.id,
        lessonId,
        feedback.questionId,
        difficulty
      );

      setShowFeedback(false);
      setFeedback(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Lesson completed
        navigate(`/english-course/progress/${lessonId}`);
      }
    } catch (error) {
      console.error('Error submitting difficulty:', error);
      // Continue anyway
      setShowFeedback(false);
      setFeedback(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        navigate(`/english-course/progress/${lessonId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-copilot-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-copilot-text-secondary mt-4">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || questions.length === 0) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-3">No Practice Available</h2>
            <p className="text-copilot-text-secondary mb-6">
              {lesson ? 
                "All questions in this lesson have been practiced recently. Check back later for reviews!" :
                "This lesson doesn't have any questions yet."
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="btn-copilot-primary"
                onClick={() => navigate('/english-course')}
              >
                ← Back to Dashboard
              </button>
              <button
                className="btn-copilot-secondary"
                onClick={() => navigate('/english-course/review')}
              >
                Review All Lessons
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          className="btn-copilot-secondary mb-6 flex items-center gap-2"
          onClick={() => navigate('/english-course')}
        >
          <span>←</span>
          Back to Dashboard
        </button>

        {/* Lesson Header */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-copilot-text-primary mb-2">
                {lesson.title}
              </h1>
              <p className="text-copilot-text-secondary text-sm">
                {lesson.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-copilot-accent-primary text-white text-sm px-4 py-2 rounded-copilot font-semibold whitespace-nowrap">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-copilot-text-secondary mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-copilot-bg-tertiary rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-copilot-gradient transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          onSubmit={handleSubmitAnswer}
          showFeedback={showFeedback}
        />

        {/* Feedback Modal */}
        <FeedbackModal
          show={showFeedback}
          feedback={feedback}
          onDifficultySelect={handleDifficultySelect}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
        />
      </main>
    </div>
  );
};

export default Practice;
