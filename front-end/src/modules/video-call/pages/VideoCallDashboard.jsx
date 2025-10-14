import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth-social/context/AuthContext';
import videoCallService from '../services/videoCallService';

const VideoCallDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [user]);

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

  const handleFindPartner = async () => {
    try {
      if (!user?.uid) {
        alert('Usuário não autenticado. Faça login primeiro.');
        return;
      }

      // Por enquanto, vamos usar nível intermediário como padrão
      // No futuro, isso pode vir do perfil do usuário
      const level = 'intermediate';

      // Entrar na fila
      const result = await videoCallService.joinQueue(user.uid, level, {
        topic: 'random',
        language: 'en',
      });

      if (result.success) {
        // Redirecionar para a página de espera
        navigate('/video-call/waiting-queue');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      alert('Erro ao entrar na fila. Tente novamente.');
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
      alert('Invalid room ID. Please enter a valid room ID (at least 3 characters, letters, numbers, hyphens, or underscores).');
    }
  };

  const handleCreateRoom = async () => {
    try {
      if (!user) {
        alert('Usuário não autenticado. Faça login primeiro.');
        return;
      }

      if (!user.uid) {
        alert('ID do usuário não disponível. Tente fazer login novamente.');
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
          createdByMe: true,
          inviteLink: `${window.location.origin}/video-call/room/${roomId}`
        }
      });
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Erro ao criar room. Tente novamente.');
    }
  };


  if (isLoading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-copilot-gradient p-4 rounded-copilot-lg mb-6 shadow-copilot-lg">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-5xl">🎥</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
            Video Call Practice
          </h1>
          <p className="text-copilot-text-secondary text-lg mb-6">
            Practice English with native speakers and learners worldwide
          </p>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 text-center">
              Your Practice Statistics
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
                <p className="text-copilot-text-secondary">Total Calls</p>
              </div>

              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">⏱️</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.totalDurationFormatted || '0m'}
                </h3>
                <p className="text-copilot-text-secondary">Total Practice Time</p>
              </div>

              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.averageDurationFormatted || '0m'}
                </h3>
                <p className="text-copilot-text-secondary">Average Call Duration</p>
              </div>

              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📅</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.thisWeekCalls || 0}
                </h3>
                <p className="text-copilot-text-secondary">This Week</p>
              </div>

              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl">📈</span>
                </div>
                <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {statistics.thisMonthCalls || 0}
                </h3>
                <p className="text-copilot-text-secondary">This Month</p>
              </div>
            </div>

            {/* Last Call Info */}
            {statistics.lastCall && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-copilot p-4 text-center">
                <p className="text-blue-800 text-sm">
                  <span className="font-semibold">Last call:</span> {new Date(statistics.lastCall).toLocaleDateString()} at {new Date(statistics.lastCall).toLocaleTimeString()}
                </p>
              </div>
            )}
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
                Start New Call
              </h3>
              <p className="text-copilot-text-secondary mb-6">
                Find a conversation partner and start practicing English right away
              </p>
              <button
                onClick={handleFindPartner}
                className="btn-copilot-primary text-lg px-8 py-4 w-full"
              >
                Find a Partner
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
                Join Room
              </h3>
              <p className="text-copilot-text-secondary mb-6">
                Create a new room or join using a room ID shared by a friend
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleCreateRoom}
                  className="btn-copilot-primary text-lg px-8 py-4 w-full"
                >
                  Create Room
                </button>
                <button
                  onClick={handleJoinRoom}
                  className="btn-copilot-secondary text-lg px-8 py-4 w-full"
                >
                  Join with Room ID
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 mb-12">
          <h3 className="text-2xl font-bold text-copilot-text-primary mb-6 text-center">
            Why Practice with Video Calls?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">🗣️</span>
              </div>
              <h4 className="text-lg font-semibold text-copilot-text-primary mb-2">
                Real Conversation
              </h4>
              <p className="text-copilot-text-secondary text-sm">
                Practice with real people in natural, flowing conversations
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">🌍</span>
              </div>
              <h4 className="text-lg font-semibold text-copilot-text-primary mb-2">
                Cultural Exchange
              </h4>
              <p className="text-copilot-text-secondary text-sm">
                Learn about different cultures while improving your English
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">💡</span>
              </div>
              <h4 className="text-lg font-semibold text-copilot-text-primary mb-2">
                Instant Feedback
              </h4>
              <p className="text-copilot-text-secondary text-sm">
                Get immediate feedback and corrections from native speakers
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-copilot p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            💡 Tips for a great video call experience
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 text-sm">
            <ul className="space-y-2">
              <li>• Test your camera and microphone before starting</li>
              <li>• Find a quiet, well-lit place for your call</li>
              <li>• Be respectful and patient with your partner</li>
              <li>• Don't worry about making mistakes - practice makes perfect!</li>
            </ul>
            <ul className="space-y-2">
              <li>• Ask questions to keep the conversation flowing</li>
              <li>• Share your experiences and listen to theirs</li>
              <li>• Have fun and enjoy the cultural exchange!</li>
              <li>• Use the suggested topics to guide your conversation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallDashboard;
