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

    // Verifica suporte ao WebRTC antes de inicializar
    const checkWebRTCSupport = () => {
      // Verifica se está em HTTPS (requerido para WebRTC, exceto localhost)
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Verifica se RTCPeerConnection está disponível
      const hasRTCPeerConnection = typeof RTCPeerConnection !== 'undefined' || 
                                   typeof webkitRTCPeerConnection !== 'undefined' || 
                                   typeof mozRTCPeerConnection !== 'undefined';
      
      // Verifica se getUserMedia está disponível
      const hasGetUserMedia = navigator.mediaDevices?.getUserMedia || 
                              navigator.getUserMedia || 
                              navigator.webkitGetUserMedia || 
                              navigator.mozGetUserMedia;

      if (!isSecure) {
        return {
          supported: false,
          error: 'WebRTC requires HTTPS. Please access this site using HTTPS (secure connection).',
          details: 'Video calls require a secure connection for privacy and security reasons.'
        };
      }

      if (!hasRTCPeerConnection && !hasGetUserMedia) {
        return {
          supported: false,
          error: 'WebRTC is not supported in this browser.',
          details: 'Please use a modern browser like Chrome, Firefox, Safari, or Edge.'
        };
      }

      return { supported: true };
    };

    const initializeDaily = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Verifica suporte ao WebRTC antes de continuar
        const webrtcCheck = checkWebRTCSupport();
        if (!webrtcCheck.supported) {
          setError(`${webrtcCheck.error}\n\n${webrtcCheck.details}`);
          setIsLoading(false);
          return;
        }

        // Cleanup previous instance
        if (dailyFrameRef.current) {
          await dailyFrameRef.current.destroy().catch(() => {});
          dailyFrameRef.current = null;
        }

        if (!containerRef.current) return;

        // Verifica se RTCPeerConnection está realmente disponível (teste mais rigoroso)
        try {
          const testConnection = new RTCPeerConnection();
          testConnection.close();
        } catch (testErr) {
          setError('WebRTC is blocked or not available.\n\nPlease check:\n• Browser permissions for camera/microphone\n• Privacy extensions that might block WebRTC\n• Try using a different browser');
          setIsLoading(false);
          return;
        }

        // Cria o iframe Daily.co com tratamento de erro na criação
        try {
          callFrame = DailyIframe.createFrame(containerRef.current, {
            showLeaveButton: false,
            iframeStyle: { width: '100%', height: '100%', border: '0', borderRadius: '8px' },
          });
          dailyFrameRef.current = callFrame;
        } catch (createError) {
          // Se a criação do frame falhar, pode ser problema de WebRTC ou configuração
          console.error('Error creating Daily.co frame:', createError);
          if (createError?.message?.includes('WebRTC') || createError?.message?.includes('not supported')) {
            setError('Failed to initialize video call.\n\nWebRTC is required but not available.\n\nPlease:\n• Allow camera/microphone permissions\n• Check browser settings\n• Try a different browser');
            setIsLoading(false);
            return;
          }
          // Re-throw para ser capturado no catch externo
          throw createError;
        }

        // Configura supressão de erro de AudioTracks
        errorHandlersRef.current.originalError = window.onerror;
        errorHandlersRef.current.originalUnhandledRejection = window.onunhandledrejection;

        const originalErrorHandler = errorHandlersRef.current.originalError;
        const originalUnhandledRejection = errorHandlersRef.current.originalUnhandledRejection;

        window.onerror = (message, source, lineno, colno, err) => {
          const errorString = err?.stack || err?.toString() || '';
          if ((message?.includes('addEventListener') || message?.includes('Cannot read properties')) &&
              (errorString.includes('AudioTracks') || source?.includes('AudioTracks'))) {
            console.warn('Suppressed Daily.co AudioTracks initialization error');
            return true;
          }
          return originalErrorHandler ? originalErrorHandler(message, source, lineno, colno, err) : false;
        };

        window.onunhandledrejection = (event) => {
          const err = event.reason;
          const errorString = err?.stack || err?.toString() || '';
          if (errorString.includes('AudioTracks') && errorString.includes('addEventListener')) {
            console.warn('Suppressed Daily.co AudioTracks promise rejection');
            event.preventDefault();
            return;
          }
          originalUnhandledRejection?.(event);
        };

        // Eventos da chamada
        callFrame
          .on('loading', () => isSubscribed && setIsLoading(true))
          .on('loaded', () => {
            if (!isSubscribed) return;
            setIsLoading(false);
            // Restaura handlers originais
            window.onerror = originalErrorHandler;
            window.onunhandledrejection = originalUnhandledRejection;
          })
          .on('started-camera', () => {
            if (!isSubscribed) return;
            setIsLoading(false);
            window.onerror = originalErrorHandler;
            window.onunhandledrejection = originalUnhandledRejection;
          })
          .on('joined-meeting', (event) => {
            if (!isSubscribed) return;
            setIsLoading(false);
            setParticipantsCount(event.participants ? Object.keys(event.participants).length : 1);
            onUserJoined?.({ id: 'local', participant: event.participants?.local });
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
            setParticipantsCount((prev) => Math.max(0, prev - 1));
            onUserLeft?.(event.participant);
            if (participantsCount <= 1) {
              setTimeout(() => isSubscribed && onEndCall?.(), 2000);
            }
          })
          .on('left-meeting', () => isSubscribed && onEndCall?.())
          .on('error', (err) => {
            if (!isSubscribed) return;
            console.error('Daily.co error:', err);
            setError(err.errorMsg || 'Failed to connect to video call');
            setIsLoading(false);
            window.onerror = originalErrorHandler;
            window.onunhandledrejection = originalUnhandledRejection;
          });

        // Join call
        await callFrame.join({ url: roomUrl, token: token || undefined, showFullscreenButton: true, showLocalVideo: true, showParticipantsBar: true });
      } catch (err) {
        console.error('Error initializing Daily.co:', err);
        if (isSubscribed) {
          let errorMessage = 'Failed to load video call. Please try again.';
          
          // Trata erro específico de WebRTC
          if (err?.message?.includes('WebRTC') || err?.message?.includes('not supported')) {
            const isSecure = window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
            
            if (!isSecure) {
              errorMessage = 'WebRTC requires HTTPS connection.\n\nPlease access this site using HTTPS (secure connection) to use video calls.';
            } else {
              errorMessage = 'WebRTC is not available in your browser.\n\nThis may be due to:\n• Browser settings blocking WebRTC\n• Extensions blocking media access\n• Firewall or network restrictions\n\nPlease try:\n• Allowing camera/microphone permissions\n• Disabling privacy/security extensions\n• Using a different browser';
            }
          }
          
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    initializeDaily();

    // Cleanup
    return () => {
      isSubscribed = false;

      if (errorHandlersRef.current.originalError !== undefined) {
        window.onerror = errorHandlersRef.current.originalError;
      }
      if (errorHandlersRef.current.originalUnhandledRejection !== undefined) {
        window.onunhandledrejection = errorHandlersRef.current.originalUnhandledRejection;
      }

      if (callFrame) {
        callFrame.destroy().catch(() => {});
      }
    };
  }, [roomUrl, token]);

  const handleEndCall = async () => {
    if (dailyFrameRef.current) {
      try {
        await dailyFrameRef.current.leave();
        await dailyFrameRef.current.destroy();
        dailyFrameRef.current = null;
      } catch (e) {
        console.warn('Error ending call:', e);
      }
    }
    onEndCall?.();
  };

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full min-h-[520px] bg-copilot-bg-primary" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-copilot-bg-primary/70 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
            <p className="text-copilot-text-secondary">Connecting to video call...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-copilot-bg-primary/70 z-20">
          <div className="text-center p-8 max-w-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-copilot-text-primary mb-2">Connection Error</h3>
            <p className="text-copilot-text-secondary mb-4 whitespace-pre-line">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="btn-copilot-primary">Try Again</button>
              <a href={roomUrl} target="_blank" rel="noopener noreferrer" className="btn-copilot-secondary">Open in New Tab</a>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-20 left-4 flex items-center gap-3 z-10">
        <button onClick={handleEndCall} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 hover:shadow-xl" title="End Call">
          <span className="text-lg">📞</span>
          <span>End Call</span>
        </button>

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
