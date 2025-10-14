import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth-social/context/AuthContext';
import videoCallService from '../services/videoCallService';

export default function WaitingQueue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queueStatus, setQueueStatus] = useState(null);
  const [timeUntilSession, setTimeUntilSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Poll queue status every 2 seconds
  useEffect(() => {
    if (!user?.uid) {
      navigate('/video-call');
      return;
    }

    const pollQueueStatus = async () => {
      try {
        const status = await videoCallService.getQueueStatus(user.uid);
        setQueueStatus(status);

        console.log('Queue status:', status);

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

        setLoading(false);
      } catch (err) {
        console.error('Error polling queue status:', err);
        setError('Erro ao verificar status da fila');
        setLoading(false);
      }
    };

    // Poll immediately
    pollQueueStatus();

    // Then poll every 2 seconds
    const interval = setInterval(pollQueueStatus, 2000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!queueStatus?.nextSessionTime) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const sessionTime = new Date(queueStatus.nextSessionTime).getTime();
      const diff = sessionTime - now;

      if (diff <= 0) {
        setTimeUntilSession('Em breve...');
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

  const handleLeaveQueue = async () => {
    try {
      setLoading(true);
      await videoCallService.leaveQueue(user.uid);
      navigate('/video-call');
    } catch (err) {
      console.error('Error leaving queue:', err);
      setError('Erro ao sair da fila');
      setLoading(false);
    }
  };

  if (loading && !queueStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando status da fila...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/video-call')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Aguardando Sessão
          </h1>
          <p className="text-gray-600">
            Você está na fila! Aguarde enquanto preparamos a próxima sessão de conversação.
          </p>
        </div>

        {/* Queue Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {queueStatus?.queuePosition || '-'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Sua Posição</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {queueStatus?.queueSize || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Na Fila</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {timeUntilSession || '--:--'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Próxima Sessão</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <div className="flex items-start">
            <div className="text-2xl mr-3">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Como funciona:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• As sessões iniciam automaticamente a cada 10 minutos</li>
                <li>• Você será emparelhado com alguém do mesmo nível</li>
                <li>• Cada sessão dura 10 minutos</li>
                <li>• Você será redirecionado automaticamente quando a sessão começar</li>
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
            Aguardando próxima sessão...
          </p>
        </div>

        {/* Leave Queue Button */}
        <button
          onClick={handleLeaveQueue}
          disabled={loading}
          className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Saindo...' : 'Sair da Fila'}
        </button>

        {/* Next Session Info */}
        {queueStatus?.nextSessionTime && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Próxima sessão: {new Date(queueStatus.nextSessionTime).toLocaleTimeString('pt-BR')}
          </div>
        )}
      </div>
    </div>
  );
}

