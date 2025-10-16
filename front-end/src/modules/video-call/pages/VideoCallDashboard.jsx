import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../../hooks/useNotification';
import { useAuth } from '../../auth-social/context/AuthContext';
import videoCallService from '../services/videoCallService';

const VideoCallDashboard = () => {
  const { t } = useTranslation(['videoCall', 'common']);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showError, showWarning } = useNotification();
  const [statistics, setStatistics] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNextPeriod, setTimeUntilNextPeriod] = useState(null);

  useEffect(() => {
    loadData();
    
    // Poll system status every 30 seconds
    const interval = setInterval(loadSystemStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    await Promise.all([loadStatistics(), loadSystemStatus()]);
  };

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      if (user) {
        const stats = await videoCallService.getCallStatistics(user.uid);
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const status = await videoCallService.getSystemStatus();
      setSystemStatus(status);
      // console.log('System status:', status);
    } catch (error) {
      console.error('Error loading system status:', error);
    }
  };

  // Timer for next period
  useEffect(() => {
    if (!systemStatus?.nextPeriodStart) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const nextPeriod = new Date(systemStatus.nextPeriodStart);
      const diff = nextPeriod - now;

      if (diff <= 0) {
        setTimeUntilNextPeriod('Soon...');
        loadSystemStatus(); // Reload status
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        if (hours > 0) {
          setTimeUntilNextPeriod(`${hours}h ${minutes}m`);
        } else {
          setTimeUntilNextPeriod(`${minutes}m`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [systemStatus?.nextPeriodStart]);

      const handleFindPartner = async () => {
        try {
          if (!user?.uid) {
            showError(t('dashboard.messages.userNotAuthenticated'));
            return;
          }

          // Check if session is active
          if (!systemStatus?.isActive || !systemStatus?.canAcceptSessions) {
            const nextHour = String(systemStatus?.nextPeriod?.start.hour || 0).padStart(2, '0');
            const nextMinute = String(systemStatus?.nextPeriod?.start.minute || 0).padStart(2, '0');
            showWarning(t('dashboard.messages.sessionUnavailable', { time: `${nextHour}:${nextMinute}` }));
            return;
          }

          // For now, use intermediate level as default
          // In the future, this can come from user profile
          const level = 'intermediate';

          // Join queue
          const result = await videoCallService.joinQueue(user.uid, level, {
            topic: 'random',
            language: 'en',
          });

          if (result.success) {
            // Redirect to waiting page
            navigate('/video-call/waiting-queue');
          } else {
            showError(result.message);
          }
        } catch (error) {
          console.error('Error joining queue:', error);
          showError(t('dashboard.messages.errorJoiningQueue'));
        }
      };

  const handleJoinRoom = () => {
    const input = prompt('Enter room ID or paste room URL:');
    if (!input) return;

    // Extract room name from URL or use as-is
    let roomId = videoCallService.extractRoomNameFromUrl(input) || input.trim();

    if (videoCallService.isValidRoomName(roomId)) {
      navigate(`/video-call/room/${roomId}`);
    } else {
      showError(t('dashboard.messages.invalidRoomId'));
    }
  };

      const handleCreateRoom = async () => {
        try {
          if (!user) {
            showError('User not authenticated. Please login first.');
            return;
          }

          if (!user.uid) {
            showError('User ID not available. Please try logging in again.');
            return;
          }

          const sessionData = await videoCallService.createVideoCallSession(user.uid, {
            topic: 'random',
            language: 'en',
            level: 'intermediate'
          });
          
          const roomId = sessionData.roomName;
          
          navigate(`/video-call/room/${roomId}`, {
            state: {
              createdByMe: true
            }
          });
        } catch (error) {
          console.error('Error creating room:', error);
          showError(t('dashboard.messages.errorCreatingRoom'));
        }
      };


  if (isLoading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">{t('dashboard.messages.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/home')}
            className="btn-copilot-secondary flex items-center gap-2"
          >
            <span>←</span>
            <span>{t('common:navigation.backToHome', { ns: 'common' })}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-copilot-gradient p-4 rounded-copilot-lg mb-6 shadow-copilot-lg">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-5xl">🎥</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
            {t('dashboard.title')}
          </h1>
          <p className="text-copilot-text-secondary text-lg mb-6">
            {t('dashboard.subtitle')}
          </p>
          
          {/* How It Works Link */}
          <div className="flex justify-center gap-4 mb-6">
            <Link
              to="/video-call/how-it-works"
              className="inline-flex items-center gap-2 px-4 py-2 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot text-copilot-text-primary hover:bg-copilot-bg-tertiary transition-colors"
            >
              <span>ℹ️</span>
              {t('dashboard.howItWorks', 'Como Funciona')}
            </Link>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 text-center">
              {t('dashboard.statistics.title')}
            </h2>
            
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📞</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.totalCalls}
                </h3>
                <p className="text-copilot-text-secondary">{t('dashboard.statistics.totalCalls')}</p>
              </div>

              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">⏱️</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.totalDurationFormatted || '0m'}
                </h3>
                <p className="text-copilot-text-secondary">{t('dashboard.statistics.totalPracticeTime')}</p>
              </div>

              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.averageDurationFormatted || '0m'}
                </h3>
                <p className="text-copilot-text-secondary">{t('dashboard.statistics.averageCallDuration')}</p>
              </div>

              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📅</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.thisWeekCalls || 0}
                </h3>
                <p className="text-copilot-text-secondary">{t('dashboard.statistics.thisWeek')}</p>
              </div>

              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📈</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.thisMonthCalls || 0}
                </h3>
                <p className="text-copilot-text-secondary">{t('dashboard.statistics.thisMonth')}</p>
              </div>
            </div>

            {/* Last Call Info */}
            {statistics.lastCall && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-copilot p-4 text-center">
                <p className="text-blue-800 text-sm">
                  {t('dashboard.statistics.lastCall', { 
                    date: new Date(statistics.lastCall).toLocaleDateString(), 
                    time: new Date(statistics.lastCall).toLocaleTimeString() 
                  })}
                </p>
              </div>
            )}
          </div>
        )}

            {/* System Status Banner */}
            {systemStatus && (
              <div className={`mb-8 rounded-copilot p-6 border-l-4 ${
                systemStatus.isActive && systemStatus.canAcceptSessions
                  ? 'bg-green-50 border-green-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">
                        {systemStatus.isActive && systemStatus.canAcceptSessions ? '🟢' : '🔴'}
                      </span>
                      <h3 className={`text-xl font-bold ${
                        systemStatus.isActive && systemStatus.canAcceptSessions
                          ? 'text-green-900'
                          : 'text-yellow-900'
                      }`}>
                        {systemStatus.isActive && systemStatus.canAcceptSessions
                          ? t('dashboard.systemStatus.sessionActive')
                          : t('dashboard.systemStatus.sessionUnavailable')}
                      </h3>
                    </div>
                    
                    {systemStatus.isActive && systemStatus.canAcceptSessions ? (
                      <p className="text-green-800 text-sm">
                        {t('dashboard.systemStatus.currentPeriod', {
                          start: `${String(systemStatus.currentPeriod.start.hour).padStart(2, '0')}:${String(systemStatus.currentPeriod.start.minute).padStart(2, '0')}`,
                          end: `${String(systemStatus.currentPeriod.end.hour).padStart(2, '0')}:${String(systemStatus.currentPeriod.end.minute).padStart(2, '0')}`
                        })}
                      </p>
                    ) : (
                      <div className="text-yellow-800 text-sm">
                        <p className="mb-1">
                          {t('dashboard.systemStatus.nextAvailable', {
                            time: `${String(systemStatus.nextPeriod?.start.hour || 0).padStart(2, '0')}:${String(systemStatus.nextPeriod?.start.minute || 0).padStart(2, '0')}`
                          })}
                        </p>
                        {timeUntilNextPeriod && (
                          <p className="font-semibold">
                            {t('dashboard.systemStatus.opensIn', { time: timeUntilNextPeriod })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Available Periods */}
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{t('dashboard.systemStatus.availableTimes')}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      {systemStatus.activePeriods?.map((period, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span>📅</span>
                          <span>
                            {String(period.start.hour).padStart(2, '0')}:{String(period.start.minute).padStart(2, '0')} - {String(period.end.hour).padStart(2, '0')}:{String(period.end.minute).padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Start New Call */}
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-3xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-copilot-text-primary mb-3">
                {t('dashboard.actions.startNewCall.title')}
              </h3>
              <p className="text-copilot-text-secondary mb-6">
                {t('dashboard.actions.startNewCall.description')}
              </p>
                  <button
                    onClick={handleFindPartner}
                    disabled={!systemStatus?.isActive || !systemStatus?.canAcceptSessions}
                    className={`text-lg px-8 py-4 w-full font-semibold rounded-lg transition-colors ${
                      systemStatus?.isActive && systemStatus?.canAcceptSessions
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {systemStatus?.isActive && systemStatus?.canAcceptSessions
                      ? t('dashboard.actions.startNewCall.findPartner')
                      : t('dashboard.actions.startNewCall.sessionUnavailable')}
                  </button>
            </div>
          </div>

          {/* Join Room */}
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-copilot flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-3xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold text-copilot-text-primary mb-3">
                {t('dashboard.actions.joinRoom.title')}
              </h3>
              <p className="text-copilot-text-secondary mb-6">
                {t('dashboard.actions.joinRoom.description')}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleCreateRoom}
                  className="btn-copilot-primary text-lg px-8 py-4 w-full"
                >
                  {t('dashboard.actions.joinRoom.createRoom')}
                </button>
                <button
                  onClick={handleJoinRoom}
                  className="btn-copilot-secondary text-lg px-8 py-4 w-full"
                >
                  {t('dashboard.actions.joinRoom.joinWithId')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 mb-12">
          <h3 className="text-2xl font-bold text-copilot-text-primary mb-6 text-center">
            {t('dashboard.features.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">🗣️</span>
              </div>
              <h4 className="text-lg font-semibold text-copilot-text-primary mb-2">
                {t('dashboard.features.realConversation.title')}
              </h4>
              <p className="text-copilot-text-secondary text-sm">
                {t('dashboard.features.realConversation.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">🌍</span>
              </div>
              <h4 className="text-lg font-semibold text-copilot-text-primary mb-2">
                {t('dashboard.features.culturalExchange.title')}
              </h4>
              <p className="text-copilot-text-secondary text-sm">
                {t('dashboard.features.culturalExchange.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">💡</span>
              </div>
              <h4 className="text-lg font-semibold text-copilot-text-primary mb-2">
                {t('dashboard.features.instantFeedback.title')}
              </h4>
              <p className="text-copilot-text-secondary text-sm">
                {t('dashboard.features.instantFeedback.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-copilot p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            💡 {t('dashboard.tips.title')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 text-sm">
            <ul className="space-y-2">
              <li>• {t('dashboard.tips.testEquipment')}</li>
              <li>• {t('dashboard.tips.findQuietPlace')}</li>
              <li>• {t('dashboard.tips.beRespectful')}</li>
              <li>• {t('dashboard.tips.dontWorryMistakes')}</li>
            </ul>
            <ul className="space-y-2">
              <li>• {t('dashboard.tips.askQuestions')}</li>
              <li>• {t('dashboard.tips.shareExperiences')}</li>
              <li>• {t('dashboard.tips.haveFun')}</li>
              <li>• {t('dashboard.tips.useSuggestedTopics')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallDashboard;
