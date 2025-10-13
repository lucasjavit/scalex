import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth-social/context/AuthContext';
import apiService from '../../../services/api';
import QuestionCard from '../components/QuestionCard';
import FeedbackModal from '../components/FeedbackModal';

const Review = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendUser, setBackendUser] = useState(null);

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

      // Load due reviews
      const reviewsData = await apiService.getDueReviews(userData.id, 20);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (submitData) => {
    try {
      const currentReview = reviews[currentReviewIndex];
      const result = await apiService.submitAnswer(
        backendUser.id,
        currentReview.lessonId,
        submitData
      );
      setFeedback(result);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFeedback(null);

    if (currentReviewIndex < reviews.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    } else {
      // All reviews completed
      navigate('/english-course');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="container py-5">
        <div className="alert alert-success text-center">
          <h3>Great job!</h3>
          <p className="mb-3">You don't have any reviews due right now.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/english-course')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentReview = reviews[currentReviewIndex];
  const currentQuestion = currentReview.question;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <button
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate('/english-course')}
        >
          ← Back to Dashboard
        </button>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>Review Session</h2>
            <p className="text-muted mb-0">
              From: {currentReview.lesson?.title || 'Lesson'}
            </p>
          </div>
          <div className="text-end">
            <span className="badge bg-warning fs-6">
              Review {currentReviewIndex + 1} of {reviews.length}
            </span>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="mb-3">
            <div className="progress" style={{ height: '10px' }}>
              <div
                className="progress-bar bg-warning"
                role="progressbar"
                style={{ width: `${((currentReviewIndex + 1) / reviews.length) * 100}%` }}
                aria-valuenow={(currentReviewIndex + 1)}
                aria-valuemin="0"
                aria-valuemax={reviews.length}
              ></div>
            </div>
          </div>

          <div className="alert alert-info mb-3">
            <small>
              This question has been reviewed <strong>{currentReview.reviewCount}</strong> times.
              {currentReview.lastReviewedAt && (
                <> Last reviewed: <strong>{new Date(currentReview.lastReviewedAt).toLocaleDateString()}</strong></>
              )}
            </small>
          </div>

          <QuestionCard
            question={currentQuestion}
            onSubmit={handleSubmitAnswer}
            showFeedback={showFeedback}
          />

          <FeedbackModal
            show={showFeedback}
            feedback={feedback}
            onNext={handleNext}
            isLastQuestion={currentReviewIndex === reviews.length - 1}
          />
        </div>
      </div>
    </div>
  );
};

export default Review;
