import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth-social/context/AuthContext';
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

  // Poll queue status every 2 seconds
  useEffect(() => {
    if (!user?.uid) {
      navigate('/video-call');
      return;
    }

    const pollQueueStatus = async () => {
      try {
        const [status, sysStatus] = await Promise.all([
          videoCallService.getQueueStatus(user.uid),
          videoCallService.getSystemStatus()
        ]);
        
        setQueueStatus(status);
        setSystemStatus(sysStatus);

        console.log('Queue status:', status);
        console.log('System status:', sysStatus);

        // Verifica se o sistema está inativo
        if (!sysStatus.isActive || !sysStatus.canAcceptSessions) {
          console.log('Sistema inativo, redirecionando para dashboard');
          navigate('/video-call');
          return;
        }

        // Se o usuário entrou em uma sessão, redireciona para a room
        if (status.currentSession) {
          console.log('Session started! Redirecting to room:', status.currentSession.roomName);
          navigate(`/video-call/room/${status.currentSession.roomName}`);
          return;
        }

        // Se não está na fila, volta para o dashboard
        if (!status.inQueue) {
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

    return () => clearInterval(interval);
  }, [user, navigate]);

  // Countdown timer for next session
  useEffect(() => {
    if (!queueStatus?.nextSessionTime) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const sessionTime = new Date(queueStatus.nextSessionTime).getTime();
      const diff = sessionTime - now;

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking queue status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full relative">
        {/* Back Button */}
        <button
          onClick={() => navigate('/video-call')}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors bg-white px-3 py-1 rounded-lg border border-gray-200 hover:border-gray-300"
        >
          <span>←</span>
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8 pt-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {queueStatus?.queuePosition || '-'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Your Position</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {queueStatus?.queueSize || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">In Queue</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {timeUntilSession || '--:--'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Next Session</div>
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

