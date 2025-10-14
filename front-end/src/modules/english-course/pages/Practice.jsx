import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../../services/api';
import { useAuth } from '../../auth-social/context/AuthContext';
import Card from '../components/Card';

const Practice = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [backendUser, setBackendUser] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

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

      // First, try to load due reviews for this lesson
      const reviewsData = await apiService.getDueReviewsForLesson(userData.id, lessonId);
      
      if (reviewsData.length > 0) {
        // If there are due reviews, show them
        const cardsData = reviewsData.map(review => review.question);
        setCards(cardsData);
      } else {
        // If no due reviews, check if user has completed this lesson
        const progressData = await apiService.getLessonProgress(userData.id, lessonId);
        if (progressData.status === 'completed') {
          // Lesson completed but no reviews due - show message
          setCards([]);
        } else {
          // Lesson not completed - show only cards that haven't been practiced yet
          const allCardsData = await apiService.getQuestionsByLesson(lessonId);
          const allReviewsData = await apiService.getAllReviews(userData.id);
          
          // Filter out cards that have already been practiced
          const practicedCardIds = allReviewsData
            .filter(review => review.lessonId === lessonId)
            .map(review => review.questionId);
          
          const unpracticedCards = allCardsData.filter(
            card => !practicedCardIds.includes(card.id)
          );
          
          setCards(unpracticedCards);
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardDifficultySubmit = async (questionId, difficulty) => {
    try {
      // Submit the card difficulty rating
      await apiService.submitCardDifficulty(
        backendUser.id,
        lessonId,
        questionId,
        difficulty
      );

      // Move to next card
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // All cards completed
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error submitting card difficulty:', error);
      alert('Failed to submit difficulty. Please try again.');
    }
  };

  const handleComplete = () => {
    navigate(`/english-course/progress/${lessonId}`);
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

  if (!lesson || cards.length === 0) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-3">
              {lesson ? 
                (lesson.status === 'completed' ? "No Reviews Due" : "Ready to Practice") :
                "No Cards Available"
              }
            </h2>
            <p className="text-copilot-text-secondary mb-6">
              {lesson ? 
                (lesson.status === 'completed' ? 
                  "All cards in this lesson are up to date! No reviews are due right now. Check back later when cards are ready for review." :
                  "This lesson is ready for practice! Complete it to add cards to your review system."
                ) :
                "This lesson doesn't have any cards yet."
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

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  // Show completion message
  if (isCompleted) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-3">
              Practice Complete!
            </h2>
            <p className="text-copilot-text-secondary mb-6">
              Great job! You've completed all the cards in this lesson. Your progress has been saved.
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
                {currentCardIndex + 1} / {cards.length}
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

        {/* Card Component */}
        <Card
          question={currentCard}
          onDifficultySubmit={handleCardDifficultySubmit}
          isLastCard={currentCardIndex === cards.length - 1}
          onComplete={handleComplete}
        />
      </main>
    </div>
  );
};

export default Practice;
