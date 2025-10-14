import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth-social/context/AuthContext';
import VideoCallSimple from '../components/VideoCallSimple';
import videoCallService from '../services/videoCallService';

const VideoCallRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTopic, setShowTopic] = useState(true);
  const [topic, setTopic] = useState('');
  const [randomTopic, setRandomTopic] = useState('');
  const [matchedUser, setMatchedUser] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState(0);
  const [inviteLink, setInviteLink] = useState('');
  const [callStarted, setCallStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 1 minute in seconds for testing
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  useEffect(() => {
    // Get data from navigation state
    if (location.state) {
      setMatchedUser(location.state.matchedUser);
      setTopic(location.state.topic);
      setRandomTopic(location.state.randomTopic);
      if (location.state.inviteLink) {
        setInviteLink(location.state.inviteLink);
      } else {
        setInviteLink(`${window.location.origin}/video-call/room/${roomId}`);
      }
    }

    // Start call tracking when component mounts
    const startCallTracking = async () => {
      if (user && !callStarted) {
        try {
          await videoCallService.startVideoCallSession(roomId);
          setCallStarted(true);
        } catch (error) {
          console.error('Error starting call tracking:', error);
        }
      }
    };

    startCallTracking();

    // Start call duration timer
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show warning when 30 seconds remaining (half time for testing)
        if (newTime === 30 && !showTimeWarning) {
          setShowTimeWarning(true);
        }
        
        // Auto-end call when time runs out
        if (newTime <= 0) {
          handleEndCall();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [location.state, user, roomId, callStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    try {
      // End call tracking
      if (user && callStarted) {
        await videoCallService.endVideoCallSession(roomId, callDuration);
      }
    } catch (error) {
      console.error('Error ending call tracking:', error);
    }
    
    navigate('/video-call');
  };

  const handleUserJoined = (participant) => {
    setParticipants(prev => prev + 1);
  };

  const handleUserLeft = (participant) => {
    setParticipants(prev => Math.max(0, prev - 1));
  };

  const getTopicDisplay = () => {
    if (topic === 'random') {
      return randomTopic;
    }
    const topics = {
      travel: "Let's talk about travel and different cultures!",
      food: "Share your favorite foods and cooking experiences!",
      technology: "Discuss the latest in technology and innovation!",
      sports: "Talk about sports, fitness, and healthy living!",
      music: "Share your favorite music and entertainment!",
      books: "Discuss books, literature, and learning!",
      career: "Talk about work, careers, and professional growth!"
    };
    return topics[topic] || "Let's have a great conversation!";
  };

  return (
    <div className="h-screen bg-copilot-bg-primary flex flex-col">
      {/* Header */}
      <div className="bg-copilot-bg-secondary border-b border-copilot-border-default p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/video-call')}
            className="btn-copilot-secondary flex items-center gap-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-copilot-border-default"></div>
          <div>
            <h1 className="text-lg font-semibold text-copilot-text-primary">
              Video Call Practice
            </h1>
            <p className="text-sm text-copilot-text-secondary">
              Room: {roomId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Share link */}
          <div className="hidden md:flex items-center gap-2 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot px-3 py-2">
            <span className="text-xs text-copilot-text-secondary hidden lg:inline">Invite:</span>
            <input
              readOnly
              value={inviteLink}
              className="text-xs text-copilot-text-primary bg-transparent outline-none w-64"
            />
            <button
              onClick={() => { navigator.clipboard.writeText(inviteLink); }}
              className="text-xs text-copilot-accent-primary font-semibold"
              title="Copy link"
            >
              Copy
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Call Duration */}
            <div className="text-sm text-copilot-text-secondary">
              <span className="font-mono text-copilot-accent-primary">
                {formatTime(callDuration)}
              </span>
              <span className="ml-2">•</span>
              <span className="ml-2">{participants} participants</span>
            </div>
            
            {/* Time Remaining Timer */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
              timeRemaining <= 15 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : timeRemaining <= 30 
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              <span className="text-lg">⏰</span>
              <span className="font-mono">
                {formatTimeRemaining(timeRemaining)}
              </span>
              <span className="text-xs">remaining</span>
            </div>
          </div>
          
          {matchedUser && (
            <div className="text-sm text-copilot-text-secondary">
              <span>Chatting with</span>
              <span className="font-semibold text-copilot-text-primary ml-1">
                {matchedUser.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Time Warning Modal */}
      {showTimeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Time Warning!
            </h3>
            
            {/* Countdown Display */}
            <div className="mb-6">
              <div className="text-4xl font-mono font-bold text-red-600 mb-2">
                {timeRemaining}
              </div>
              <div className="text-lg text-gray-600 mb-2">
                seconds remaining
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeRemaining / 60) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Please wrap up your conversation quickly!
            </p>
            
            <button
              onClick={() => setShowTimeWarning(false)}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Topic Suggestion */}
      {showTopic && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="font-semibold">Conversation Topic</h3>
                <p className="text-sm opacity-90">{getTopicDisplay()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowTopic(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Video Call Component */}
      <div className="flex-1 relative">
        <VideoCallSimple
          roomName={roomId}
          onEndCall={handleEndCall}
          onUserJoined={handleUserJoined}
          onUserLeft={handleUserLeft}
        />
      </div>

      {/* Footer with tips */}
      <div className="bg-copilot-bg-secondary border-t border-copilot-border-default p-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-6 text-xs text-copilot-text-secondary">
            <span>💡 Don't worry about mistakes - practice makes perfect!</span>
            <span>🎯 Ask questions to keep the conversation flowing</span>
            <span>🌍 Enjoy the cultural exchange!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallRoom;
