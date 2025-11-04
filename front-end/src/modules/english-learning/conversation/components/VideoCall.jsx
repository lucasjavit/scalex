import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../auth-social/context/AuthContext';
import videoCallService from '../services/videoCallService';
import VideoCallDaily from './VideoCallDaily';

const VideoCall = ({ roomName, onEndCall, onUserJoined, onUserLeft }) => {
  const { user } = useAuth();
  const [roomUrl, setRoomUrl] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomName || !user) return;

    const loadDailyRoom = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get Daily.co token and room URL from backend
        const headers = await videoCallService.getAuthHeaders();
        const baseURL = import.meta?.env?.VITE_API_URL ?? 'http://localhost:3000';
        
        const response = await fetch(
          `${baseURL}/english-learning/video-call/daily/token`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              roomName: roomName,
              userId: user.uid,
              isOwner: false,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to get Daily.co token: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setRoomUrl(result.data.roomUrl);
          setToken(result.data.token);
          setIsLoading(false);
        } else {
          throw new Error(result.message || 'Failed to get Daily.co room');
        }
      } catch (err) {
        console.error('Error loading Daily.co room:', err);
        setError(err.message || 'Failed to load video call room');
        setIsLoading(false);
      }
    };

    loadDailyRoom();
  }, [roomName, user]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-copilot-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Loading video call room...</p>
        </div>
      </div>
    );
  }

  if (error || !roomUrl) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-copilot-bg-primary">
        <div className="text-center p-8 max-w-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-copilot-text-primary mb-2">
            Connection Error
          </h3>
          <p className="text-copilot-text-secondary mb-4">{error || 'Failed to load room'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-copilot-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VideoCallDaily
      roomUrl={roomUrl}
      token={token}
      onEndCall={onEndCall}
      onUserJoined={onUserJoined}
      onUserLeft={onUserLeft}
    />
  );
};

export default VideoCall;
