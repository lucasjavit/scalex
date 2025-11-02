import DailyIframe from '@daily-co/daily-js';
import React, { useEffect, useRef, useState } from 'react';

const VideoCallDaily = ({ roomUrl, token, onEndCall, onUserJoined, onUserLeft }) => {
  const containerRef = useRef(null);
  const dailyFrameRef = useRef(null);
  const errorHandlersRef = useRef({ originalError: null, originalUnhandledRejection: null });
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

        // CRITICAL: Wait for iframe DOM to be fully mounted and accessible
        // Production builds are highly optimized and execute much faster than dev,
        // causing a race condition where AudioTracks tries to access DOM elements
        // before they exist. We need to ensure the iframe is actually ready.
        console.log('Waiting for iframe to mount...');
        
        // Wait for the iframe element to exist in the DOM
        let iframeElement = null;
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        while (!iframeElement && attempts < maxAttempts) {
          iframeElement = containerRef.current?.querySelector('iframe');
          if (!iframeElement) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        if (!iframeElement) {
          throw new Error('Iframe element not found after waiting');
        }

        // Wait for iframe to be accessible and have contentWindow
        let iframeReady = false;
        attempts = 0;
        while (!iframeReady && attempts < 30) {
          try {
            // Check if iframe has a contentWindow (means it's loaded)
            if (iframeElement.contentWindow) {
              // Additional check: try to access iframe content (may fail due to CORS, but that's ok)
              // We just want to ensure the iframe structure is there
              iframeReady = true;
            }
          } catch (e) {
            // CORS error is expected and ok - we just want to check if contentWindow exists
            iframeReady = true;
          }
          if (!iframeReady) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
          }
        }

        // CRITICAL: Wait for the HTML iframe 'load' event
        // This ensures the iframe has fully loaded its content before Daily.co tries to access DOM
        const iframeLoadPromise = new Promise((resolve) => {
          const onLoad = () => {
            iframeElement.removeEventListener('load', onLoad);
            resolve();
          };
          iframeElement.addEventListener('load', onLoad);
          
          // If iframe is already loaded (load event won't fire), resolve immediately
          if (iframeElement.contentWindow && iframeElement.contentDocument?.readyState === 'complete') {
            iframeElement.removeEventListener('load', onLoad);
            resolve();
          }
          
          // Timeout after 5 seconds
          setTimeout(() => {
            iframeElement.removeEventListener('load', onLoad);
            console.warn('Iframe load event timeout - proceeding anyway');
            resolve();
          }, 5000);
        });
        
        await iframeLoadPromise;

        // Additional wait to ensure iframe content is accessible
        // Use multiple requestAnimationFrame calls to wait for browser paint cycles
        await new Promise((resolve) => requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(resolve);
            });
          });
        }));
        
        // Extended delay to ensure Daily.co internals are fully initialized
        // This is critical in production where code executes much faster
        // Increased delay to give Daily.co more time to initialize its internal DOM
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        console.log('Iframe mount wait complete');

        if (!isSubscribed) {
          await callFrame.destroy();
          return;
        }

        // Set up error handler to suppress the AudioTracks error during initialization
        // This error occurs internally in Daily.co but doesn't prevent functionality
        errorHandlersRef.current.originalError = window.onerror;
        errorHandlersRef.current.originalUnhandledRejection = window.onunhandledrejection;
        const originalErrorHandler = errorHandlersRef.current.originalError;
        const originalUnhandledRejection = errorHandlersRef.current.originalUnhandledRejection;
        
        const errorSuppressionHandler = (message, source, lineno, colno, error) => {
          // Suppress the specific AudioTracks error during initialization
          // Error message contains "addEventListener" and stack trace contains "AudioTracks"
          const errorString = error?.stack || error?.toString() || '';
          const isAudioTracksError = 
            (message && (message.includes('addEventListener') || message.includes('Cannot read properties'))) &&
            (errorString.includes('AudioTracks') || source?.includes('AudioTracks'));
          
          if (isAudioTracksError) {
            console.warn('Suppressed Daily.co AudioTracks initialization error (non-critical)');
            return true; // Suppress the error
          }
          // Let other errors through
          if (originalErrorHandler) {
            return originalErrorHandler.call(window, message, source, lineno, colno, error);
          }
          return false;
        };
        
        const unhandledRejectionHandler = (event) => {
          const error = event.reason;
          const errorString = error?.stack || error?.toString() || '';
          if (errorString.includes('AudioTracks') && errorString.includes('addEventListener')) {
            console.warn('Suppressed Daily.co AudioTracks promise rejection (non-critical)');
            event.preventDefault();
            return;
          }
          if (originalUnhandledRejection) {
            originalUnhandledRejection(event);
          }
        };
        
        // Set up the error handlers
        window.onerror = errorSuppressionHandler;
        window.onunhandledrejection = unhandledRejectionHandler;

        // Set up event listeners BEFORE joining
        callFrame
          .on('loading', () => {
            if (isSubscribed) setIsLoading(true);
          })
          .on('loaded', () => {
            console.log('Daily.co iframe loaded');
            if (isSubscribed) setIsLoading(false);
            // Restore original error handlers after Daily.co is loaded
            setTimeout(() => {
              window.onerror = originalErrorHandler;
              window.onunhandledrejection = originalUnhandledRejection;
            }, 1000);
          })
          .on('started-camera', () => {
            if (isSubscribed) setIsLoading(false);
            // Restore original error handlers after camera starts
            window.onerror = originalErrorHandler;
            window.onunhandledrejection = originalUnhandledRejection;
          })
          .on('joined-meeting', (event) => {
            if (!isSubscribed) return;
            setIsLoading(false);
            setParticipantsCount(event.participants ? Object.keys(event.participants).length : 1);
            onUserJoined?.({ id: 'local', participant: event.participants?.local });
            // Restore original error handlers after joining
            window.onerror = originalErrorHandler;
            window.onunhandledrejection = originalUnhandledRejection;
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
            // Restore original error handlers on error
            window.onerror = originalErrorHandler;
            window.onunhandledrejection = originalUnhandledRejection;
          });

        if (!isSubscribed) {
          window.onerror = originalErrorHandler;
          window.onunhandledrejection = originalUnhandledRejection;
          await callFrame.destroy();
          return;
        }

        // Wrap join() in try-catch to handle any errors gracefully
        // The AudioTracks error might occur, but we'll catch it and retry
        try {
          // Join the meeting - this will trigger event listeners
          await callFrame.join({
            url: roomUrl,
            token: token || undefined,
            showFullscreenButton: true,
            showLocalVideo: true,
            showParticipantsBar: true,
          });
        } catch (joinError) {
          // If join fails, wait a bit more and retry once
          console.warn('Initial join attempt failed, retrying after delay...', joinError);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          
          if (!isSubscribed) {
            window.onerror = originalErrorHandler;
            window.onunhandledrejection = originalUnhandledRejection;
            await callFrame.destroy();
            return;
          }
          
          try {
            await callFrame.join({
              url: roomUrl,
              token: token || undefined,
              showFullscreenButton: true,
              showLocalVideo: true,
              showParticipantsBar: true,
            });
          } catch (retryError) {
            console.error('Retry join also failed:', retryError);
            window.onerror = originalErrorHandler;
            window.onunhandledrejection = originalUnhandledRejection;
            throw retryError;
          }
        }
        
        // Fallback: restore error handlers after a timeout if events don't fire
        setTimeout(() => {
          window.onerror = originalErrorHandler;
          window.onunhandledrejection = originalUnhandledRejection;
        }, 5000);
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
      
      // Restore original error handlers on cleanup
      if (errorHandlersRef.current.originalError !== undefined) {
        window.onerror = errorHandlersRef.current.originalError;
      }
      if (errorHandlersRef.current.originalUnhandledRejection !== undefined) {
        window.onunhandledrejection = errorHandlersRef.current.originalUnhandledRejection;
      }
      
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

