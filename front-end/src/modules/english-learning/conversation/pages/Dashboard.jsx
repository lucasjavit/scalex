import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import BackButton from '../../../../components/BackButton';
import { useNotification } from '../../../../hooks/useNotification';
import { useAuth } from '../../../auth-social/context/AuthContext';
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
  const [showAllPeriods, setShowAllPeriods] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');

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
    setShowJoinRoomModal(true);
  };

  const handleJoinRoomSubmit = () => {
    if (!roomIdInput) {
      setShowJoinRoomModal(false);
      return;
    }

    // Extract room name from URL or use as-is
    let roomId = videoCallService.extractRoomNameFromUrl(roomIdInput) || roomIdInput.trim();

    if (videoCallService.isValidRoomName(roomId)) {
      navigate(`/video-call/room/${roomId}`, {
        state: {
          createdByMe: true  // Manual room join - disable queue monitoring
        }
      });
    } else {
      showError(t('dashboard.messages.invalidRoomId'));
    }

    setShowJoinRoomModal(false);
    setRoomIdInput('');
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
        <BackButton to="/home" label={t('common:navigation.backToHome', { ns: 'common' })} />

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
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📞</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.totalCalls}
                </h3>
                <p className="text-copilot-text-secondary">{t('dashboard.statistics.totalCalls')}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">⏱️</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.totalDurationFormatted || '0m'}
                </h3>
                <p className="text-copilot-text-secondary">{t('dashboard.statistics.totalPracticeTime')}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.averageDurationFormatted || '0m'}
                </h3>
                <p className="text-copilot-text-secondary">{t('dashboard.statistics.averageCallDuration')}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📅</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.thisWeekCalls || 0}
                </h3>
                <p className="text-copilot-text-secondary">{t('dashboard.statistics.thisWeek')}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-6 text-center">
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
                  <div className="ml-6 min-w-[240px]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-700">{t('dashboard.systemStatus.availableTimes')}</p>
                      <button
                        onClick={() => setShowAllPeriods(!showAllPeriods)}
                        className="text-gray-600 hover:text-gray-900 transition-all p-1.5 hover:bg-gray-100 rounded-full"
                        title={showAllPeriods ? 'Show available only' : 'Show all periods'}
                      >
                        <svg
                          className={`w-5 h-5 transition-transform duration-200 ${showAllPeriods ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    {(() => {
                      // Sort periods by start time
                      const sortedPeriods = [...(systemStatus.activePeriods || [])].sort((a, b) => {
                        const timeA = a.start.hour * 60 + a.start.minute;
                        const timeB = b.start.hour * 60 + b.start.minute;
                        return timeA - timeB;
                      });

                      // Get current time in minutes
                      const now = new Date();
                      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

                      // Filter periods based on showAllPeriods state
                      const displayPeriods = showAllPeriods
                        ? sortedPeriods
                        : sortedPeriods.filter(p => {
                            const periodEndTime = p.end.hour * 60 + p.end.minute;
                            // Show if period hasn't ended yet
                            return periodEndTime >= currentTimeInMinutes;
                          });

                      // Divide into AM (00:00-11:59) and PM (12:00-23:59)
                      const amPeriods = displayPeriods.filter(p => p.start.hour < 12);
                      const pmPeriods = displayPeriods.filter(p => p.start.hour >= 12);

                      // Format time to 12-hour format with AM/PM
                      const formatTime12h = (hour, minute) => {
                        const h = hour % 12 || 12;
                        const m = String(minute).padStart(2, '0');
                        const period = hour < 12 ? 'AM' : 'PM';
                        return `${h}:${m} ${period}`;
                      };

                      // Check if period is currently active
                      const isCurrentPeriod = (period) => {
                        if (!systemStatus.currentPeriod) return false;
                        return period.start.hour === systemStatus.currentPeriod.start.hour &&
                               period.start.minute === systemStatus.currentPeriod.start.minute;
                      };

                      // Check if period has already passed
                      const isPastPeriod = (period) => {
                        const periodEndTime = period.end.hour * 60 + period.end.minute;
                        return periodEndTime < currentTimeInMinutes;
                      };

                      return (
                        <div className="space-y-1.5">
                          {/* AM Periods */}
                          {amPeriods.map((period, idx) => {
                            const isCurrent = isCurrentPeriod(period);
                            const isPast = isPastPeriod(period);
                            return (
                              <div
                                key={`am-${idx}`}
                                className={`
                                  flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                  ${isCurrent
                                    ? 'bg-green-100 text-green-800 border border-green-300 shadow-sm'
                                    : isPast
                                    ? 'bg-gray-100 text-gray-400 border border-gray-200 opacity-60'
                                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                                  }
                                `}
                              >
                                <span className="text-sm">{isCurrent ? '▶️' : isPast ? '✓' : '🕐'}</span>
                                <span className="font-mono">
                                  {formatTime12h(period.start.hour, period.start.minute)}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="font-mono">
                                  {formatTime12h(period.end.hour, period.end.minute)}
                                </span>
                              </div>
                            );
                          })}

                          {/* Divider between AM and PM */}
                          {amPeriods.length > 0 && pmPeriods.length > 0 && (
                            <div className="flex items-center gap-2 py-1">
                              <div className="flex-1 h-px bg-gray-300"></div>
                            </div>
                          )}

                          {/* PM Periods */}
                          {pmPeriods.map((period, idx) => {
                            const isCurrent = isCurrentPeriod(period);
                            const isPast = isPastPeriod(period);
                            return (
                              <div
                                key={`pm-${idx}`}
                                className={`
                                  flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                  ${isCurrent
                                    ? 'bg-green-100 text-green-800 border border-green-300 shadow-sm'
                                    : isPast
                                    ? 'bg-gray-100 text-gray-400 border border-gray-200 opacity-60'
                                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                                  }
                                `}
                              >
                                <span className="text-sm">{isCurrent ? '▶️' : isPast ? '✓' : '🕐'}</span>
                                <span className="font-mono">
                                  {formatTime12h(period.start.hour, period.start.minute)}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="font-mono">
                                  {formatTime12h(period.end.hour, period.end.minute)}
                                </span>
                              </div>
                            );
                          })}

                          {/* No available periods message */}
                          {!showAllPeriods && displayPeriods.length === 0 && (
                            <div className="text-xs text-gray-500 italic py-2">
                              No periods available now. Click "Show all" to see past periods.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Start New Call */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-8">
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
                    className={`text-lg px-8 py-4 w-full font-semibold rounded-lg transition-all duration-200 ${
                      systemStatus?.isActive && systemStatus?.canAcceptSessions
                        ? 'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-700 dark:to-blue-800 text-green-800 dark:text-green-100 shadow-lg border border-green-300 dark:border-blue-600 hover:shadow-xl hover:from-green-200 hover:to-blue-200 dark:hover:from-green-600 dark:hover:to-blue-700 active:shadow-inner active:translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400'
                    }`}
                  >
                    {systemStatus?.isActive && systemStatus?.canAcceptSessions
                      ? t('dashboard.actions.startNewCall.findPartner')
                      : t('dashboard.actions.startNewCall.sessionUnavailable')}
                  </button>
            </div>
          </div>

          {/* Join Room */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-8">
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
                  className="text-lg px-8 py-4 w-full font-semibold rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600 hover:shadow-xl hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 active:shadow-inner active:translate-y-0.5 transition-all duration-200"
                >
                  {t('dashboard.actions.joinRoom.createRoom')}
                </button>
                <button
                  onClick={handleJoinRoom}
                  className="text-lg px-8 py-4 w-full font-semibold rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600 hover:shadow-xl hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 active:shadow-inner active:translate-y-0.5 transition-all duration-200"
                >
                  {t('dashboard.actions.joinRoom.joinWithId')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-8 mb-12">
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

      {/* Join Room Modal */}
      {showJoinRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-copilot-bg-secondary rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-copilot-text-primary mb-4">
              {t('dashboard.actions.joinRoom.title')}
            </h3>
            <p className="text-copilot-text-secondary mb-4 text-sm">
              Enter room ID or paste room URL:
            </p>
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJoinRoomSubmit();
                }
              }}
              placeholder="e.g., scalex-1762125167223-2214gg4x6ztj"
              className="w-full px-4 py-2 bg-copilot-bg-primary border border-copilot-border-default rounded-lg text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary mb-6"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowJoinRoomModal(false);
                  setRoomIdInput('');
                }}
                className="px-4 py-2 bg-copilot-bg-tertiary text-copilot-text-secondary rounded-lg hover:bg-copilot-bg-primary transition-colors"
              >
                {t('common:buttons.cancel')}
              </button>
              <button
                onClick={handleJoinRoomSubmit}
                className="px-4 py-2 bg-copilot-accent-primary text-white rounded-lg hover:bg-copilot-accent-secondary transition-colors"
              >
                {t('dashboard.actions.joinRoom.joinWithId')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallDashboard;
