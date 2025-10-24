import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../auth-social/context/AuthContext';

const VideoCallSimple = ({ roomName, onEndCall, onUserJoined, onUserLeft }) => {
  const { user } = useAuth();
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const jitsiDomain = import.meta?.env?.VITE_JITSI_DOMAIN || 'meet.jit.si';

  useEffect(() => {
    if (!roomName) return;

    // console.log('🚀 Loading Jitsi iframe for room:', roomName);
    // console.log('🚀 Domain:', jitsiDomain);

    // Simple iframe approach - let Jitsi handle everything
    const baseUrl = `https://${jitsiDomain}`;
    const iframeUrl = `${baseUrl}/${roomName}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.notifications=[]&interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true`;

    // console.log('🚀 Iframe URL:', iframeUrl);

    if (iframeRef.current) {
      iframeRef.current.src = iframeUrl;
    }

    // Set loading timeout
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Listen for iframe load
    const handleIframeLoad = () => {
      // console.log('✅ Iframe loaded');
      setIsLoading(false);
      setError(null);
    };

    const handleIframeError = () => {
      console.error('❌ Iframe failed to load');
      setError('Failed to load video call. Please check if you accepted the SSL certificate.');
      setIsLoading(false);
    };

    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);
      iframeRef.current.addEventListener('error', handleIframeError);
    }

    return () => {
      clearTimeout(timeout);
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleIframeLoad);
        iframeRef.current.removeEventListener('error', handleIframeError);
      }
    };
  }, [roomName, jitsiDomain]);

  const handleEndCall = () => {
    onEndCall?.();
  };

  return (
    <div className="h-full w-full relative">
      {/* Jitsi iframe */}
      <iframe
        ref={iframeRef}
        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
        className="h-full w-full min-h-[520px] border-0"
        title="Jitsi Meet"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-copilot-bg-primary/70 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
            <p className="text-copilot-text-secondary">Connecting to video call...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-copilot-bg-primary/70 z-20">
          <div className="text-center p-8 max-w-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-copilot-text-primary mb-2">
              Connection Error
            </h3>
            <p className="text-copilot-text-secondary mb-4">{error}</p>

            {/* SSL Certificate Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Most Common Fix:</h4>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Open <a href={`https://${jitsiDomain}`} target="_blank" rel="noopener noreferrer" className="underline font-semibold">https://{jitsiDomain}</a> in a new tab</li>
                <li>Accept the SSL certificate warning (click "Advanced" → "Continue to localhost")</li>
                <li>Come back here and click "Try Again"</li>
              </ol>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-copilot-primary"
              >
                Try Again
              </button>
              <a
                href={`https://${jitsiDomain}/${roomName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-copilot-secondary"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Custom controls overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={handleEndCall}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-copilot font-semibold shadow-copilot-lg transition-colors duration-200"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCallSimple;
