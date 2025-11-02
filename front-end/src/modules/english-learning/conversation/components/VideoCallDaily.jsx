import DailyIframe from '@daily-co/daily-js';
import React, { useEffect, useRef, useState } from 'react';

const VideoCallDaily = ({ roomUrl, token, onEndCall, onUserJoined, onUserLeft }) => {
  const containerRef = useRef(null);
  const dailyFrameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantsCount, setParticipantsCount] = useState(0);

  useEffect(() => {
    if (!roomUrl) return;

    let isSubscribed = true;
    let callFrame = null;

    const initializeDaily = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!containerRef.current) {
          setTimeout(initializeDaily, 100);
          return;
        }

        // Cleanup any existing instance before creating a new one
        if (dailyFrameRef.current) {
          try {
            await dailyFrameRef.current.destroy();
            dailyFrameRef.current = null;
          } catch (e) {
            console.log('Error destroying previous instance:', e);
          }
        }

        if (!isSubscribed) return;

        // Create Daily.co iframe
        callFrame = DailyIframe.createFrame(containerRef.current, {
          showLeaveButton: false,
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '8px',
          },
        });

        dailyFrameRef.current = callFrame;

        // Wait for iframe DOM to be fully mounted (critical for production)
        // This prevents AudioTracks from trying to access undefined elements
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!isSubscribed) {
          await callFrame.destroy();
          return;
        }

        // Set up event listeners BEFORE joining
        callFrame
          .on('loading', () => {
            if (isSubscribed) setIsLoading(true);
          })
          .on('loaded', () => {
            console.log('Daily.co iframe loaded');
            if (isSubscribed) setIsLoading(false);
          })
          .on('started-camera', () => {
            if (isSubscribed) setIsLoading(false);
          })
          .on('joined-meeting', (event) => {
            if (!isSubscribed) return;
            setIsLoading(false);
            setParticipantsCount(event.participants ? Object.keys(event.participants).length : 1);
            onUserJoined?.({ id: 'local', participant: event.participants?.local });
          })
          .on('participant-joined', (event) => {
            if (!isSubscribed) return;
            setParticipantsCount((prev) => prev + 1);
            onUserJoined?.(event.participant);
          })
          .on('participant-left', (event) => {
            if (!isSubscribed) return;
            const newCount = participantsCount - 1;
            setParticipantsCount((prev) => Math.max(0, prev - 1));
            onUserLeft?.(event.participant);

            // If partner left (only local user remains), trigger end call after 2 seconds
            // This gives time for UI to show partner left message
            if (newCount === 1) {
              console.log('Partner left the call, ending session in 2 seconds...');
              setTimeout(() => {
                if (isSubscribed) {
                  console.log('Partner left - automatically ending call');
                  onEndCall?.();
                }
              }, 2000);
            }
          })
          .on('left-meeting', () => {
            if (isSubscribed) onEndCall?.();
          })
          .on('error', (error) => {
            if (!isSubscribed) return;
            console.error('Daily.co error:', error);
            setError(error.errorMsg || 'Failed to connect to video call');
            setIsLoading(false);
          });

        if (!isSubscribed) {
          await callFrame.destroy();
          return;
        }

        // Join the meeting - this will trigger event listeners
        await callFrame.join({
          url: roomUrl,
          token: token || undefined,
          showFullscreenButton: true,
          showLocalVideo: true,
          showParticipantsBar: true,
        });
      } catch (err) {
        console.error('Error initializing Daily.co:', err);
        if (isSubscribed) {
          setError('Failed to load video call. Please try again.');
          setIsLoading(false);
        }
      }
    };

    initializeDaily();

    // Cleanup
    return () => {
      isSubscribed = false;
      if (callFrame) {
        callFrame.destroy().catch((e) => console.log('Cleanup error:', e));
      }
    };
  }, [roomUrl, token]);

  const handleEndCall = async () => {
    if (dailyFrameRef.current) {
      try {
        // Leave the meeting first
        await dailyFrameRef.current.leave();

        // Then destroy the iframe instance
        await dailyFrameRef.current.destroy();
        dailyFrameRef.current = null;

        console.log('Successfully ended Daily.co call');
      } catch (e) {
        console.warn('Error ending call:', e);
      }
    }

    // Notify parent component
    onEndCall?.();
  };

  return (
    <div className="h-full w-full relative">
      {/* Daily.co container */}
      <div ref={containerRef} className="h-full w-full min-h-[520px] bg-copilot-bg-primary" />

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

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-copilot-primary"
              >
                Try Again
              </button>
              <a
                href={roomUrl}
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

      {/* Top left controls */}
      <div className="absolute top-20 left-4 flex items-center gap-3 z-10">
        {/* End Call button */}
        <button
          onClick={handleEndCall}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 hover:shadow-xl"
          title="End Call"
        >
          <span className="text-lg">📞</span>
          <span>End Call</span>
        </button>

        {/* Participants count badge */}
        {participantsCount > 0 && (
          <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
            {participantsCount} {participantsCount === 1 ? 'participant' : 'participants'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallDaily;

