import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../services/api';
import { useAuth } from '../../auth-social/context/AuthContext';
import Card from '../components/Card';

const Review = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [backendUser, setBackendUser] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    try {
      setLoading(true);

      // Get backend user
      const userData = await apiService.getUserByFirebaseUid(user.uid);
      setBackendUser(userData);

      // Load due reviews (cards that are due for review)
      const reviewsData = await apiService.getDueReviews(userData.id, 50);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardDifficultySubmit = async (questionId, difficulty) => {
    try {
      const currentReview = reviews[currentReviewIndex];
      await apiService.submitCardDifficulty(
        backendUser.id,
        currentReview.lessonId,
        questionId,
        difficulty
      );

      if (currentReviewIndex < reviews.length - 1) {
        setCurrentReviewIndex(currentReviewIndex + 1);
      } else {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error submitting card difficulty:', error);
      alert('Failed to submit difficulty. Please try again.');
    }
  };

  const handleComplete = () => {
    navigate('/english-course');
  };

  if (loading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
              <p className="text-copilot-text-secondary">Loading review cards...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-3">
              Great job!
            </h2>
            <p className="text-copilot-text-secondary mb-6">
              You don't have any cards due for review right now. All your cards are up to date!
            </p>
            <button
              className="btn-copilot-primary"
              onClick={() => navigate('/english-course')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentReview = reviews[currentReviewIndex];
  const currentQuestion = currentReview.question;

  // Completion screen
  if (isCompleted) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-3">
              Review Complete!
            </h2>
            <p className="text-copilot-text-secondary mb-6">
              Great job! You've completed all the cards due for review. Your progress has been saved.
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
                onClick={() => {
                  setCurrentReviewIndex(0);
                  setIsCompleted(false);
                  loadReviews();
                }}
              >
                Review Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              className="btn-copilot-secondary flex items-center gap-2"
              onClick={() => navigate('/english-course')}
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
            <div className="h-8 w-px bg-copilot-border-default"></div>
            <div>
              <h1 className="text-2xl font-bold text-copilot-text-primary">
                Review Session
              </h1>
              <p className="text-copilot-text-secondary">
                {currentReview.lesson?.title || 'Reviewing cards'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full border border-yellow-200">
              Card {currentReviewIndex + 1} of {reviews.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-copilot-text-primary">Review Progress</span>
            <span className="text-sm text-copilot-text-secondary">
              {Math.round(((currentReviewIndex + 1) / reviews.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-copilot-border-default rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentReviewIndex + 1) / reviews.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Review Info */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div className="text-copilot-text-secondary">
              This card has been reviewed <span className="font-semibold text-copilot-text-primary">{currentReview.reviewCount || 0}</span> times
            </div>
            {currentReview.lastReviewedAt && (
              <div className="text-copilot-text-secondary">
                Last reviewed: <span className="font-semibold text-copilot-text-primary">
                  {new Date(currentReview.lastReviewedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <Card
              question={currentQuestion}
              onDifficultySubmit={handleCardDifficultySubmit}
              isLastCard={currentReviewIndex === reviews.length - 1}
              onComplete={handleComplete}
              srsLabels={currentReview.srsCandidateLabels}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
