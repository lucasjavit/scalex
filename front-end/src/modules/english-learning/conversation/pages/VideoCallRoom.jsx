import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../auth-social/context/AuthContext';
import VideoCall from '../components/VideoCall';
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
  const [callStarted, setCallStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const isEndingCallRef = useRef(false); // Prevent multiple calls to handleEndCall
  const durationIntervalRef = useRef(null); // Store interval reference
  const sessionCheckIntervalRef = useRef(null); // Store interval reference
  const isManualRoomRef = useRef(false); // Track if this is a manually created room (not from queue)

  useEffect(() => {
    // Get data from navigation state
    if (location.state) {
      setMatchedUser(location.state.matchedUser);
      setTopic(location.state.topic);
      setRandomTopic(location.state.randomTopic);
      // Check if this is a manually created room (Create Room button)
      if (location.state.createdByMe === true) {
        isManualRoomRef.current = true;
        console.log('This is a manually created room - queue monitoring disabled');
      }
    }

    // Mark that call has started (no API call needed for queue-created rooms)
    if (user && !callStarted) {
      setCallStarted(true);
    }

    // Start call duration timer
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
      setTimeRemaining(prev => {
        const newTime = prev - 1;

        // Show warning when 5 minutes (300 seconds) remaining
        if (newTime === 300 && !showTimeWarning) {
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

    // Poll every 2 seconds to check if session is still active
    // ONLY for queue-based rooms (Find Partner), NOT for manually created rooms (Create Room)
    if (!isManualRoomRef.current) {
      sessionCheckIntervalRef.current = setInterval(async () => {
        if (user && callStarted && !isEndingCallRef.current) {
          const isActive = await videoCallService.checkSessionStatus(user.uid);
          if (!isActive && !isEndingCallRef.current) {
            console.log('Session no longer active - partner left. Redirecting to queue...');
            handlePartnerLeft();
          }
        }
      }, 2000);
    } else {
      console.log('Manual room - session monitoring disabled');
    }

    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (sessionCheckIntervalRef.current) clearInterval(sessionCheckIntervalRef.current);
    };
  }, [location.state, user, callStarted]);

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

  // Called when partner leaves - this user was automatically added to queue by backend
  const handlePartnerLeft = useCallback(async () => {
    // Prevent multiple calls
    if (isEndingCallRef.current) {
      console.log('Already handling partner left, skipping...');
      return;
    }

    isEndingCallRef.current = true;

    // IMMEDIATELY clear intervals to prevent them from running after navigation
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }

    // Partner who did NOT click "End Call" was automatically added to queue by backend
    // So just redirect to waiting-queue without calling leaveSession
    console.log('Partner left - you were automatically added to queue. Redirecting to waiting-queue...');
    navigate('/video-call/waiting-queue');
  }, [navigate]);

  const handleEndCall = useCallback(async () => {
    // Prevent multiple calls
    if (isEndingCallRef.current) {
      console.log('Already ending call, skipping...');
      return;
    }

    isEndingCallRef.current = true;

    // IMMEDIATELY clear intervals to prevent them from running after navigation
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }

    try {
      // Remove user from active session
      // shouldRejoinQueue=false means this user clicked "End Call" and goes to dashboard
      // The backend will automatically add the PARTNER to the queue
      if (user && callStarted) {
        await videoCallService.leaveSession(user.uid, false);
        console.log('Successfully left session - redirecting to dashboard');
      }
    } catch (error) {
      console.error('Error leaving session:', error);

      // IF ANY ERROR OCCURS: Force remove user from queue (both database and memory)
      try {
        console.log('Attempting to force leave queue due to error...');
        await videoCallService.leaveQueue(user.uid);
        console.log('Successfully force-removed from queue');
      } catch (queueError) {
        console.error('Error force-removing from queue:', queueError);
        // Even if queue removal fails, continue to navigation
      }
    }

    // User who clicked "End Call" returns to dashboard
    navigate('/video-call');
  }, [user, callStarted, navigate]);

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
            {/* Only show Room ID for manually created rooms (not from queue) */}
            {isManualRoomRef.current && (
              <p className="text-sm text-copilot-text-secondary">
                Room: {roomId}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Share Room ID - Only show for manually created rooms */}
          {isManualRoomRef.current && (
            <div className="hidden md:flex items-center gap-2 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot px-3 py-2">
              <span className="text-xs text-copilot-text-secondary">Room ID:</span>
              <span className="text-xs font-mono text-copilot-text-primary font-semibold">
                {roomId}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  alert('Room ID copied!');
                }}
                className="text-xs text-copilot-accent-primary font-semibold hover:text-copilot-accent-secondary"
                title="Copy Room ID"
              >
                Copy
              </button>
            </div>
          )}

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
        <VideoCall
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
