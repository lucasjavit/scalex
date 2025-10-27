import { useEffect, useRef, useState } from 'react';
import BackButton from '../../../components/BackButton';
import { useNotification } from '../../../hooks/useNotification';
import apiService from '../../../services/api';
import courseApiService from '../../english-learning/course/services/courseApi';
import AdminLayout from '../components/AdminLayout';

export default function EnglishCourseProgressAdmin() {
  const { showSuccess, showError, showConfirmation } = useNotification();
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [stages, setStages] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Load all users on component mount
  useEffect(() => {
    loadAllUsers();
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    if (email.length > 0) {
      const filtered = allUsers.filter(u => 
        u.email.toLowerCase().includes(email.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(email.toLowerCase()))
      ).slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [email, allUsers]);

  const loadAllUsers = async () => {
    try {
      const users = await apiService.request('/users', 'GET');
      setAllUsers(users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const selectUser = async (selectedUser) => {
    setEmail(selectedUser.email);
    setShowSuggestions(false);
    setUser(selectedUser);
    setStages([]);
    setUnits([]);
    await loadUserProgress(selectedUser.id);
  };

  const handleResetProgress = async () => {
    if (!user) return;
    
    showConfirmation(
      'Reset Progress',
      `Are you sure you want to reset all progress for ${user.email}? This action cannot be undone.`,
      async () => {
        try {
          setLoading(true);
          await apiService.request(`/api/english-course/progress/admin/users/${user.id}/reset`, 'POST');
          showSuccess('User progress has been reset successfully');
          
          // Reload user progress
          await loadUserProgress(user.id);
        } catch (err) {
          console.error('Error resetting user progress:', err);
          showError('Failed to reset user progress');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const searchUser = async () => {
    if (!email) {
      showError('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setUser(null);
      setStages([]);
      setUnits([]);

      // Search for user by email
      const userData = await apiService.request(`/users/email/${email}`, 'GET');
      
      if (userData) {
        setUser(userData);
        await loadUserProgress(userData.id);
      } else {
        showError('User not found');
      }
    } catch (err) {
      console.error('Error searching user:', err);
      showError('Failed to search user');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async (userId) => {
    try {
      // Load all stages
      const stagesData = await courseApiService.getAllStages();
      
      // Load user progress for each stage
      const progressPromises = stagesData.map(async (stage) => {
        try {
          const progress = await apiService.request(`/api/english-course/progress/users/${userId}/stages/${stage.id}`, 'GET');
          return {
            ...stage,
            progress: progress || {
              isUnlocked: stage.orderIndex === 1,
              isCompleted: false,
              completedUnits: 0,
              totalUnits: 0
            }
          };
        } catch (err) {
          return {
            ...stage,
            progress: {
              isUnlocked: stage.orderIndex === 1,
              isCompleted: false,
              completedUnits: 0,
              totalUnits: 0
            }
          };
        }
      });

      const stagesWithProgress = await Promise.all(progressPromises);
      setStages(stagesWithProgress);
    } catch (err) {
      console.error('Error loading user progress:', err);
      showError('Failed to load user progress');
    }
  };

  const loadStageUnits = async (stageId) => {
    if (!user) return;
    
    try {
      const unitsData = await courseApiService.getUnitsByStage(stageId);
      
      // Load progress for each unit
      const unitsWithProgress = await Promise.all(
        unitsData.map(async (unit) => {
          try {
            const progress = await apiService.request(`/api/english-course/progress/users/${user.id}/units/${unit.id}`, 'GET');
            return {
              ...unit,
              isCompleted: progress?.isCompleted || false,
              watchTime: progress?.watchTime || 0
            };
          } catch (err) {
            return {
              ...unit,
              isCompleted: false,
              watchTime: 0
            };
          }
        })
      );

      setUnits(unitsWithProgress);
      setSelectedStage(stages.find(s => s.id === stageId));
    } catch (err) {
      console.error('Error loading stage units:', err);
      showError('Failed to load stage units');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-copilot-bg-primary py-8">
        <div className="max-w-7xl mx-auto px-6">
          <BackButton to="/admin" />

          <h1 className="text-4xl font-bold text-copilot-text-primary mb-8">
            English Course Progress Management
          </h1>

          {/* Search Section */}
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 mb-8 relative">
            <h2 className="text-xl font-bold text-copilot-text-primary mb-4">
              Search User by Email
            </h2>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="email"
                  placeholder="Enter user email or name"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                  onFocus={() => email.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="input-copilot w-full"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => selectUser(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-copilot-bg-hover transition-colors border-b border-copilot-border-default last:border-b-0"
                      >
                        <div className="font-semibold text-copilot-text-primary">{suggestion.email}</div>
                        {suggestion.name && (
                          <div className="text-sm text-copilot-text-secondary">{suggestion.name}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={searchUser}
                disabled={loading}
                className="btn-copilot-primary px-6 whitespace-nowrap"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 mb-8">
              <h2 className="text-xl font-bold text-copilot-text-primary mb-4">
                User Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-copilot-text-secondary">Email:</p>
                  <p className="font-semibold text-copilot-text-primary">{user.email}</p>
                </div>
                <div>
                  <p className="text-copilot-text-secondary">Name:</p>
                  <p className="font-semibold text-copilot-text-primary">{user.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Admin Actions */}
          {user && (
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 mb-8">
              <h2 className="text-xl font-bold text-copilot-text-primary mb-4">
                Admin Actions
              </h2>
              <button
                onClick={handleResetProgress}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                🗑️ Reset All Progress
              </button>
            </div>
          )}

          {/* Stages List */}
          {user && stages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-copilot-text-primary mb-4">
                Course Stages Progress
              </h2>
              <div className="space-y-4">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 cursor-pointer hover:border-copilot-accent-primary hover:shadow-copilot-xl transition-all duration-200"
                    onClick={() => loadStageUnits(stage.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {stage.orderIndex}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-copilot-text-primary">
                            {stage.title}
                          </h3>
                          <p className="text-copilot-text-secondary text-sm">
                            {stage.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          stage.progress?.isCompleted
                            ? 'bg-green-500 text-white'
                            : stage.progress?.isUnlocked
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {stage.progress?.isCompleted
                            ? 'Completed'
                            : stage.progress?.isUnlocked
                            ? 'In Progress'
                            : 'Locked'}
                        </div>
                        {stage.progress && stage.progress.totalUnits > 0 && (
                          <p className="text-sm text-copilot-text-secondary mt-2">
                            {stage.progress.completedUnits}/{stage.progress.totalUnits} units
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Units List */}
          {selectedStage && units.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-copilot-text-primary mb-4">
                Units - {selectedStage.title}
              </h2>
              <div className="space-y-4">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {unit.orderIndex}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-copilot-text-primary">
                            {unit.title}
                          </h3>
                          <p className="text-copilot-text-secondary text-sm">
                            {unit.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          unit.isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {unit.isCompleted ? 'Completed' : 'Not Completed'}
                        </div>
                        {unit.watchTime > 0 && (
                          <p className="text-xs text-copilot-text-secondary mt-1">
                            Watch time: {Math.floor(unit.watchTime / 60)}min
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

