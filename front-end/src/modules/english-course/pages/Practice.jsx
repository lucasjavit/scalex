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
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(null);

  useEffect(() => {
    console.log('🔄 useEffect triggered - user:', !!user, 'lessonId:', lessonId);
    if (user && !hasLoaded) {
      setHasLoaded(true);
      loadLessonData();
    }
  }, [user, lessonId, hasLoaded]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading lesson data for lessonId:', lessonId);

      // Get backend user
      const userData = await apiService.getUserByFirebaseUid(user.uid);
      setBackendUser(userData);
      console.log('✅ Backend user:', userData.id);

      // Load lesson
      const lessonData = await apiService.getEnglishLesson(lessonId);
      setLesson(lessonData);
      console.log('✅ Lesson loaded:', lessonData.title, lessonData.level);

      // Check lesson progress first
      const progressData = await apiService.getLessonProgress(userData.id, lessonId);
      setLessonProgress(progressData);
      console.log('📊 Lesson progress:', progressData.status);
      
      if (progressData.status === 'completed') {
        // Lesson completed - check for due reviews
        const reviewsData = await apiService.getDueReviewsForLesson(userData.id, lessonId);
        console.log('📅 Due reviews for completed lesson:', reviewsData.length);
        
        if (reviewsData.length > 0) {
          // Show due review cards
          const cardsData = reviewsData.map(review => review.question);
          setCards(cardsData);
          console.log('✅ Showing due review cards:', cardsData.length);
        } else {
          // No reviews due - show completion message
          setCards([]);
          console.log('❌ Lesson completed - no reviews due');
        }
      } else {
        // Lesson not completed - check if there are due reviews first
        const reviewsData = await apiService.getDueReviewsForLesson(userData.id, lessonId);
        console.log('📅 Due reviews for incomplete lesson:', reviewsData.length);
        
        if (reviewsData.length > 0) {
          // Show due review cards
          const cardsData = reviewsData.map(review => review.question);
          setCards(cardsData);
          console.log('✅ Showing due review cards:', cardsData.length);
        } else {
          // No reviews due - show all cards for practice
          const allCardsData = await apiService.getQuestionsByLesson(lessonId, userData.id);
          console.log('📚 Total questions in lesson:', allCardsData.length);
          
          setCards(allCardsData);
          console.log('✅ Showing all cards for practice:', allCardsData.length);
        }
      }
    } catch (error) {
      console.error('❌ Error loading lesson:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const handleCardDifficultySubmit = async (questionId, difficulty) => {
    try {
      console.log('🎯 Submitting card difficulty:', {
        userId: backendUser?.id,
        lessonId,
        questionId,
        difficulty
      });
      
      // Submit the card difficulty rating
      await apiService.submitCardDifficulty(
        backendUser.id,
        lessonId,
        questionId,
        difficulty
      );
      
      console.log('✅ Card difficulty submitted successfully');

      // Move to next card
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // All cards completed
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('❌ Error submitting card difficulty:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Failed to submit difficulty: ${error.message}. Please try again.`);
    }
  };

  const handleComplete = () => {
    navigate(`/english-course/progress/${lessonId}`);
  };

  console.log('🔄 Component state - loading:', loading, 'lesson:', !!lesson, 'cards.length:', cards.length, 'currentCardIndex:', currentCardIndex);
  
  if (loading) {
    console.log('⏳ Showing loading screen');
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-copilot-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-copilot-text-secondary mt-4">Loading lesson...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Render check - lesson:', !!lesson, 'cards.length:', cards.length);
  
  if (!lesson || cards.length === 0) {
    console.log('❌ Showing no cards message - lesson:', !!lesson, 'cards.length:', cards.length);
    return (
      <div className="bg-copilot-bg-primary min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-3">
              {lesson ? 
                (lessonProgress?.status === 'completed' ? "No Reviews Due" : "Ready to Practice") :
                "No Cards Available"
              }
            </h2>
            <p className="text-copilot-text-secondary mb-6">
              {lesson ? 
                (lessonProgress?.status === 'completed' ? 
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

  console.log('🎯 Final render check - isCompleted:', isCompleted, 'currentCard:', !!currentCard, 'cards.length:', cards.length);

  // Show completion message
  if (isCompleted) {
    console.log('🎉 Showing completion message');
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

  console.log('✅ Rendering practice interface with cards:', cards.length);
  
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
              <h2 className="text-2xl font-bold text-copilot-text-primary">
                {lesson?.title}
              </h2>
              <p className="text-copilot-text-secondary text-sm">
                {lesson?.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-copilot-text-tertiary text-sm">
                Progress: {currentCardIndex + 1} / {cards.length}
              </span>
              <div className="w-24 bg-copilot-bg-tertiary rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Component */}
        {currentCard ? (
          <Card
            question={currentCard}
            onDifficultySubmit={handleCardDifficultySubmit}
            isLastCard={currentCardIndex === cards.length - 1}
            onComplete={handleComplete}
          />
        ) : (
          <div className="text-center text-red-500">
            <p>Error: No card found at index {currentCardIndex}</p>
            <p>Cards length: {cards.length}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Practice;
