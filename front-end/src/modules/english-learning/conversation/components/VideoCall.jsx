import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../auth-social/context/AuthContext';

const VideoCall = ({ roomName, onEndCall, onUserJoined, onUserLeft }) => {
  const { user } = useAuth();
  const jitsiContainerRef = useRef(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasInitializedRef = useRef(false);
  const loadingTimeoutRef = useRef(null);
  const lastInitErrorRef = useRef(null);
  // Read embedding configuration from env (supports JaaS or self-host)
  const jitsiDomain = import.meta?.env?.VITE_JITSI_DOMAIN || 'meet.jit.si';
  const jitsiTenant = import.meta?.env?.VITE_JITSI_TENANT || '';
  const jitsiJwt = import.meta?.env?.VITE_JITSI_JWT || '';

  useEffect(() => {
    if (!roomName) return;

    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        // Use the configured Jitsi domain for the external API script
        const scriptDomain = jitsiDomain.includes('meet.jit.si')
          ? 'https://meet.jit.si'
          : `https://${jitsiDomain}`;
        script.src = `${scriptDomain}/external_api.js`;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        // console.log('🔵 Starting initializeJitsi...');
        setIsLoading(true);
        setError(null);

        // console.log('🔵 Loading Jitsi script...');
        await loadJitsiScript();
        // console.log('🔵 Script loaded');

        if (!window.JitsiMeetExternalAPI) {
          throw new Error('Jitsi API not available (external_api.js blocked)');
        }

        // Dispose previous instance if any and clear container
        if (jitsiApi) {
          // console.log('🔵 Disposing previous API instance...');
          try { jitsiApi.dispose(); } catch (e) { /* no-op */ }
        }

        if (!jitsiContainerRef.current) {
          // console.log('⚠️ Container not ready, waiting...');
          // Wait for container to be in the DOM
          requestAnimationFrame(initializeJitsi);
          return;
        }

        // console.log('🔵 Clearing container...');
        jitsiContainerRef.current.innerHTML = '';

        // Prevent double-initialization (React StrictMode) for the same room
        if (hasInitializedRef.current) {
          // console.log('⚠️ Already initialized, skipping...');
          return;
        }
        // console.log('🔵 Proceeding with initialization...');

        // Use the domain directly - Jitsi will handle it
        const domain = jitsiDomain; // localhost:8443
        const roomPath = jitsiTenant ? `${jitsiTenant}/${roomName}` : roomName;

        // console.log('🚀 Jitsi Domain:', domain);
        // console.log('🚀 Room:', roomPath);

        const options = {
          roomName: roomPath,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            prejoinPageEnabled: false, // Skip pre-join page for faster testing
            
            // Disable toolbar buttons
            toolbarButtons: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
            ],
            
            // Disable specific features
            disableWhiteboard: true,
            disableShare: true,
            disableStats: true,
            disableBroadcast: true,
            disableRecording: true,
            disableLiveStreaming: true,
            
            // Disable toolbar completely for cleaner interface
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'hangup', 'chat'
            ],
            
            // Disable other UI elements
            DISABLE_VIDEO_BACKGROUND: true,
            DISABLE_TRANSCRIPTION_SUBTITLES: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            DISABLE_PRESENCE_STATUS: true,
            DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
            DISABLE_FOCUS_INDICATOR: true,
            DISABLE_RECORDING: true,
            DISABLE_LIVE_STREAMING: true,
            DISABLE_WHITEBOARD: true,
            DISABLE_SHARE: true,
            DISABLE_STATS: true,
            
            // Disable settings menu options
            DISABLE_SETTINGS_WHITEBOARD: true,
            DISABLE_SETTINGS_SHARE: true,
            DISABLE_SETTINGS_STATS: true,
            DISABLE_SETTINGS_BROADCAST: true,
            DISABLE_SETTINGS_RECORDING: true,
            DISABLE_SETTINGS_LIVE_STREAMING: true,
            
            // Hide specific settings sections
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'sounds'],
            
            // Disable specific features in settings
            disableWhiteboardInSettings: true,
            disableShareInSettings: true,
            disableStatsInSettings: true,
            disableBroadcastInSettings: true,
            disableRecordingInSettings: true,
            disableLiveStreamingInSettings: true
          }
        };

        let api;
        try {
          // console.log('🟢 Creating JitsiMeetExternalAPI...');
          api = new window.JitsiMeetExternalAPI(domain, options);
          // console.log('✅ API created:', api);
          // console.log('✅ API _url:', api._url);

          // Check iframe after a moment
          setTimeout(() => {
            const iframe = jitsiContainerRef.current?.querySelector('iframe');
            // console.log('🔍 Iframe exists?', !!iframe);
            if (iframe) {
              // console.log('🔍 Iframe src:', iframe.src);
            }
            // console.log('🔍 Container children:', jitsiContainerRef.current?.childElementCount);
          }, 500);

        } catch (e) {
          console.error('❌ Error:', e);
          throw e;
        }

        // Event listeners
        api.addListener('iframeReady', () => {
          // Iframe is ready; allow UI to appear even before join
          // console.log('✅ iframeReady event fired');
          setIsLoading(false);
        });

        api.addListener('videoConferenceJoined', async () => {
          // console.log('✅ Joined video conference');
          setIsLoading(false);
          try {
            const participants = await api.getParticipantsInfo?.();
            // Notify parent to reflect local join and current count
            onUserJoined?.({ id: 'local' , info: participants });
          } catch (_) {
            onUserJoined?.({ id: 'local' });
          }
        });

        api.addListener('videoConferenceLeft', () => {
          // console.log('Left video conference');
          onEndCall?.();
        });

        api.addListener('participantJoined', (participant) => {
          // console.log('Participant joined:', participant);
          onUserJoined?.(participant);
        });

        api.addListener('participantLeft', (participant) => {
          // console.log('Participant left:', participant);
          onUserLeft?.(participant);
        });

        api.addListener('readyToClose', () => {
          // console.log('Ready to close');
          onEndCall?.();
        });

        api.addListener('error', (error) => {
          console.error('Jitsi error:', error);
          setError('Failed to join video call. Please try again.');
          setIsLoading(false);
        });

        // Fallback: stop loading after 15s even if no event fired
        loadingTimeoutRef.current = window.setTimeout(() => {
          // If iframe didn't mount properly, surface fallback
          // console.log('⏰ Timeout reached (15s)');
          // console.log('Container exists?', !!jitsiContainerRef.current);
          // console.log('Container children:', jitsiContainerRef.current?.childElementCount);
          // console.log('Container HTML:', jitsiContainerRef.current?.innerHTML.substring(0, 200));

          if (!jitsiContainerRef.current || jitsiContainerRef.current.childElementCount === 0) {
            console.error('❌ Iframe was not created');
            setError('Unable to render embedded call. Open in a new tab below.');
          } else {
            // console.log('✅ Iframe exists but events may not have fired');
            // Give it a bit more time, iframe might still be loading
          }
          setIsLoading(false);
        }, 15000);

        setJitsiApi(api);
        hasInitializedRef.current = true;

      } catch (err) {
        console.error('Error initializing Jitsi:', err);
        lastInitErrorRef.current = err?.message || String(err);
        setError('Failed to load video call. Check adblock/permissions and try again.');
        setIsLoading(false);
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (jitsiApi) {
        try { jitsiApi.dispose(); } catch (_) {}
      }
      hasInitializedRef.current = false;
    };
  }, [roomName, user]);

  const handleEndCall = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
    }
    onEndCall?.();
  };

  return (
    <div className="h-full w-full relative">
      {/* Jitsi container always mounted */}
      <div ref={jitsiContainerRef} className="h-full w-full min-h-[520px] bg-copilot-bg-primary" />

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
            {lastInitErrorRef.current && (
              <p className="text-xs text-copilot-text-secondary opacity-70 break-all mb-4">{lastInitErrorRef.current}</p>
            )}

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

export default VideoCall;
