import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../hooks/useNotification';
import apiService from '../../../services/api';
import AdminLayout from '../components/AdminLayout';

const UserManagement = () => {
  const { t } = useTranslation(['englishCourse', 'common']);
  const { showSuccess, showError, showConfirmation } = useNotification();
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [userStatistics, setUserStatistics] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Load all users on component mount
  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      console.log('Loading all users...');
      const users = await apiService.getAllUsers();
      console.log('Users loaded:', users);
      setAllUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Handle input change with autocomplete
  const handleInputChange = (value) => {
    console.log('Input changed:', value);
    console.log('All users:', allUsers);
    setEmail(value);
    
    if (value.length > 0) {
      const filtered = allUsers.filter(user => 
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(value.toLowerCase())
      );
      console.log('Filtered suggestions:', filtered);
      setSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (selectedUser) => {
    setEmail(selectedUser.email);
    setShowSuggestions(false);
    // Automatically search for the selected user
    searchUser(selectedUser.email);
  };

  // Search for specific user
  const searchUser = async (emailToSearch) => {
    try {
      setLoading(true);
      setError(null);
      
      // Search for user by email
      const userData = await apiService.getUserByEmail(emailToSearch);
      setUser(userData);
      
      if (userData) {
        // Get user progress
        const progressData = await apiService.getUserProgress(userData.id);
        setUserProgress(progressData);
        
        // Get user statistics
        const statsData = await apiService.getUserStatistics(userData.id);
        setUserStatistics(statsData);
        
        // Get user reviews
        const reviewsData = await apiService.getAllUserReviews(userData.id);
        setUserReviews(reviewsData);
      }
    } catch (err) {
      setError('User not found or error loading data');
      console.error('Error searching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    await searchUser(email);
  };

  const handleResetProgress = async (lessonId) => {
    showConfirmation(
      'Are you sure you want to reset this lesson progress? This action cannot be undone.',
      () => {
        resetProgress(lessonId);
      }
    );
  };

  const resetProgress = async (lessonId) => {
    try {
      await apiService.resetLessonProgress(user.id, lessonId);
      // Reload data
      handleSearch({ preventDefault: () => {} });
      showSuccess('Lesson progress reset successfully');
    } catch (err) {
      showError('Error resetting lesson progress');
      console.error('Error resetting progress:', err);
    }
  };

  const handleResetAllProgress = async () => {
    showConfirmation(
      'Are you sure you want to reset ALL progress for this user? This action cannot be undone.',
      () => {
        resetAllProgress();
      }
    );
  };

  const resetAllProgress = async () => {
    try {
      await apiService.resetAllUserProgress(user.id);
      // Reload data
      handleSearch({ preventDefault: () => {} });
      showSuccess('All user progress reset successfully');
    } catch (err) {
      showError('Error resetting all progress');
      console.error('Error resetting all progress:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-2">
            User Management
          </h1>
          <p className="text-copilot-text-secondary">
            Search and manage user progress in English Course
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 mb-8">
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
            Search User
          </h2>
          
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={email}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => email.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search by email or name..."
                className="w-full px-4 py-3 border border-copilot-border-default rounded-copilot focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                required
              />
              
              {/* Autocomplete suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-copilot-border-default rounded-copilot shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="px-4 py-3 hover:bg-copilot-bg-secondary cursor-pointer border-b border-copilot-border-default last:border-b-0"
                    >
                      <div className="font-medium text-copilot-text-primary">
                        {suggestion.fullName || 'No name'}
                      </div>
                      <div className="text-sm text-copilot-text-secondary">
                        {suggestion.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-copilot-primary px-8 py-3 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-copilot text-red-800">
              {error}
            </div>
          )}
        </div>

        {/* User Information */}
        {user && (
          <div className="space-y-8">
            {/* User Basic Info */}
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
              <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
                User Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">Basic Info</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {user.fullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Preferred Language:</strong> {user.preferredLanguage || 'N/A'}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">Account Details</h3>
                  <div className="space-y-2">
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Statistics */}
            {userStatistics && (
              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
                <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
                  Learning Statistics
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-copilot p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{userStatistics.totalLessons}</div>
                    <div className="text-sm text-blue-800">Total Lessons</div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-copilot p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{userStatistics.completedLessons}</div>
                    <div className="text-sm text-green-800">Completed</div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-copilot p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-600">{userStatistics.inProgressLessons}</div>
                    <div className="text-sm text-yellow-800">In Progress</div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-copilot p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{userStatistics.totalAttempts}</div>
                    <div className="text-sm text-purple-800">Total Attempts</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Progress */}
            {userProgress && userProgress.length > 0 && (
              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-copilot-text-primary">
                    Lesson Progress
                  </h2>
                  <button
                    onClick={handleResetAllProgress}
                    className="bg-red-500 text-white px-4 py-2 rounded-copilot hover:bg-red-600 transition-colors"
                  >
                    Reset All Progress
                  </button>
                </div>
                
                <div className="space-y-4">
                  {userProgress.map((progress) => (
                    <div key={progress.lessonId} className="bg-copilot-bg-primary border border-copilot-border-default rounded-copilot p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-copilot-text-primary">
                            {progress.lessonTitle}
                          </h3>
                          <p className="text-sm text-copilot-text-secondary mb-2">
                            Level: {progress.level} • Lesson {progress.lessonNumber}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-semibold">Status:</span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                progress.status === 'completed' ? 'bg-green-100 text-green-800' :
                                progress.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {progress.status}
                              </span>
                            </div>
                            
                            <div>
                              <span className="font-semibold">Accuracy:</span> {progress.accuracyPercentage}%
                            </div>
                            
                            <div>
                              <span className="font-semibold">Correct:</span> {progress.correctAnswers}
                            </div>
                            
                            <div>
                              <span className="font-semibold">Attempts:</span> {progress.totalAttempts}
                            </div>
                          </div>
                          
                          {progress.completedAt && (
                            <p className="text-xs text-copilot-text-secondary mt-2">
                              Completed: {new Date(progress.completedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleResetProgress(progress.lessonId)}
                          className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reviews */}
            {userReviews && userReviews.length > 0 && (
              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
                <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
                  Recent Reviews
                </h2>
                
                <div className="space-y-3">
                  {userReviews.slice(0, 10).map((review) => (
                    <div key={review.id} className="bg-copilot-bg-primary border border-copilot-border-default rounded-copilot p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-copilot-text-primary">
                            {review.question?.frontText || 'Question not found'}
                          </p>
                          <p className="text-sm text-copilot-text-secondary">
                            Lesson: {review.lesson?.title || 'Unknown'} • 
                            Ease Factor: {review.easeFactor} • 
                            Interval: {review.intervalDays} days
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-copilot-text-secondary">
                            {new Date(review.lastReviewedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-copilot-text-secondary">
                            Review #{review.reviewCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
