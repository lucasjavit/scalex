import { useEffect, useState, useRef } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useAuth } from '../../../auth-social/context/AuthContext';
import videoCallService from '../services/videoCallService';

export default function WaitingQueue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queueStatus, setQueueStatus] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [timeUntilSession, setTimeUntilSession] = useState(null);
  const [timeUntilPeriodEnd, setTimeUntilPeriodEnd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPeriodWarning, setShowPeriodWarning] = useState(false);
  const isJoiningSession = useRef(false); // Track if user is being redirected to a session
  const leaveQueueTimeout = useRef(null); // Ref to store timeout ID across renders


  // Poll queue status every 2 seconds
  useEffect(() => {
    if (!user?.uid) {
      navigate('/video-call');
      return;
    }

    // If component remounts, cancel any pending leaveQueue timeout
    if (leaveQueueTimeout.current) {
      console.log('✅ Component remounted - canceling pending leaveQueue');
      clearTimeout(leaveQueueTimeout.current);
      leaveQueueTimeout.current = null;
    }

    let pollCount = 0; // Track number of polls

    const pollQueueStatus = async () => {
      try {
        const [status, sysStatus] = await Promise.all([
          videoCallService.getQueueStatus(user.uid),
          videoCallService.getSystemStatus()
        ]);

        pollCount++;

        setQueueStatus(status);
        setSystemStatus(sysStatus);

        console.log('Queue status:', status);
        console.log('System status:', sysStatus);
        console.log('nextSessionTime:', status?.nextSessionTime);
        console.log('timeUntilSession state:', timeUntilSession);

        // Verifica se o sistema está inativo
        if (!sysStatus.isActive || !sysStatus.canAcceptSessions) {
          console.log('Sistema inativo, redirecionando para dashboard');
          navigate('/video-call');
          return;
        }

        // Se o usuário entrou em uma sessão, redireciona para a room
        if (status.currentSession) {
          console.log('Session started! Redirecting to room:', status.currentSession.roomName);
          isJoiningSession.current = true; // Mark that user is joining a session
          navigate(`/video-call/room/${status.currentSession.roomName}`);
          return;
        }

        // Se não está na fila, volta para o dashboard
        // IMPORTANTE: Só redireciona após 3 polls (6 segundos) para evitar race condition
        if (!status.inQueue && pollCount > 3) {
          console.log('User not in queue anymore. Redirecting to dashboard.');
          navigate('/video-call');
          return;
        }

        // Verifica se está perto do fim do período
        if (sysStatus.currentPeriod) {
          const periodEnd = new Date();
          periodEnd.setHours(sysStatus.currentPeriod.end.hour);
          periodEnd.setMinutes(sysStatus.currentPeriod.end.minute);
          const minutesUntilEnd = (periodEnd - new Date()) / (1000 * 60);

          if (minutesUntilEnd <= 5 && minutesUntilEnd > 0) {
            setShowPeriodWarning(true);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error polling queue status:', err);
        setError('Error checking queue status');
        setLoading(false);
      }
    };

    // Poll immediately
    pollQueueStatus();

    // Then poll every 2 seconds
    const interval = setInterval(pollQueueStatus, 2000);

    // Cleanup: Clear interval AND remove from queue when component unmounts
    return () => {
      clearInterval(interval);

      // Delay leaving queue to avoid removing user during fast remounts (React StrictMode, HMR)
      // Only actually leave if component stays unmounted for 500ms
      leaveQueueTimeout.current = setTimeout(() => {
        if (user?.uid && !isJoiningSession.current) {
          console.log('🚪 Leaving queue after unmount delay');
          videoCallService.leaveQueue(user.uid).catch(err => {
            console.error('Error leaving queue on unmount:', err);
          });
        }
        leaveQueueTimeout.current = null;
      }, 500);
    };
  }, [user, navigate]);

  // Handle page unload - remove user from queue when closing/navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user?.uid && !isJoiningSession.current) {
        // Use navigator.sendBeacon for reliable request on page unload
        const blob = new Blob([JSON.stringify({ userId: user.uid })], {
          type: 'application/json',
        });
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/english-learning/video-call/queue/leave/${user.uid}`,
          blob
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // Countdown timer for next session
  useEffect(() => {
    if (!queueStatus?.nextSessionTime) {
      console.log('⏱️ No nextSessionTime, showing waiting message');
      setTimeUntilSession('Waiting...');
      return;
    }

    console.log('⏱️ Setting up countdown for:', queueStatus.nextSessionTime);

    const updateCountdown = () => {
      const now = new Date().getTime();
      const sessionTime = new Date(queueStatus.nextSessionTime).getTime();
      const diff = sessionTime - now;

      console.log('⏱️ Countdown update - diff:', diff, 'ms');

      if (diff <= 0) {
        setTimeUntilSession('Starting soon...');
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeUntilSession(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [queueStatus?.nextSessionTime]);

  // Countdown timer for period end
  useEffect(() => {
    if (!systemStatus?.currentPeriod) {
      return;
    }

    const updatePeriodCountdown = () => {
      const now = new Date();
      const periodEnd = new Date();
      periodEnd.setHours(systemStatus.currentPeriod.end.hour);
      periodEnd.setMinutes(systemStatus.currentPeriod.end.minute);
      periodEnd.setSeconds(0);
      
      const diff = periodEnd - now;

        if (diff <= 0) {
          setTimeUntilPeriodEnd('Closing...');
        } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeUntilPeriodEnd(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updatePeriodCountdown();
    const interval = setInterval(updatePeriodCountdown, 1000);

    return () => clearInterval(interval);
  }, [systemStatus?.currentPeriod]);

  const handleLeaveQueue = async () => {
    try {
      setLoading(true);
      await videoCallService.leaveQueue(user.uid);
      navigate('/video-call');
    } catch (err) {
      console.error('Error leaving queue:', err);
      setError('Error leaving queue');
      setLoading(false);
    }
  };

  if (loading && !queueStatus) {
    return (
      <div className="min-h-screen bg-copilot-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking queue status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-copilot-bg-primary flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/video-call')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-copilot-bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Waiting for Session
          </h1>
          <p className="text-gray-600">
            You're in the queue! Please wait while we prepare the next conversation session.
          </p>
        </div>

        {/* Period Warning */}
        {showPeriodWarning && systemStatus?.currentPeriod && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 animate-pulse">
            <div className="flex items-start">
              <div className="text-2xl mr-3">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Period ending soon!
                </h3>
                <p className="text-sm text-yellow-800 mb-2">
                  Current period ends in <span className="font-mono font-bold">{timeUntilPeriodEnd}</span>
                </p>
                <p className="text-sm text-yellow-800">
                  Next available: {String(systemStatus.nextPeriod?.start.hour).padStart(2, '0')}:{String(systemStatus.nextPeriod?.start.minute).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Status Info */}
        {systemStatus?.currentPeriod && !showPeriodWarning && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex items-start">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Session Active
                </h3>
                <p className="text-sm text-green-800">
                  Current period: {String(systemStatus.currentPeriod.start.hour).padStart(2, '0')}:{String(systemStatus.currentPeriod.start.minute).padStart(2, '0')} - {String(systemStatus.currentPeriod.end.hour).padStart(2, '0')}:{String(systemStatus.currentPeriod.end.minute).padStart(2, '0')}
                  {' '}•{' '}
                  Time remaining: <span className="font-mono font-bold">{timeUntilPeriodEnd}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Queue Info */}
        <div className="flex justify-center mb-8">
          <div className="bg-purple-50 rounded-lg p-6 text-center min-w-[200px]">
            <div className="text-4xl font-bold text-purple-600">
              {timeUntilSession || '--:--'}
            </div>
            <div className="text-sm text-gray-600 mt-2">Next Session</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <div className="flex items-start">
            <div className="text-2xl mr-3">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sessions start automatically every 10 minutes</li>
                <li>• You'll be paired with someone at the same level</li>
                <li>• Each session lasts 10 minutes</li>
                <li>• You'll be automatically redirected when the session starts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-2">
            Waiting for next session...
          </p>
        </div>

        {/* Leave Queue Button */}
        <button
          onClick={handleLeaveQueue}
          disabled={loading}
          className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Leaving...' : 'Leave Queue'}
        </button>

        {/* Next Session Info */}
        {queueStatus?.nextSessionTime && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Next session: {new Date(queueStatus.nextSessionTime).toLocaleTimeString('en-US')}
          </div>
        )}
      </div>
    </div>
  );
}

