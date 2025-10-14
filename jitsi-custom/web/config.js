// ScaleX Custom Jitsi Meet configuration.

var config = {};

config.hosts = {};
config.hosts.domain = 'meet.jitsi';

var subdir = '<!--# echo var="subdir" default="" -->';
var subdomain = '<!--# echo var="subdomain" default="" -->';
if (subdir.startsWith('<!--')) {
    subdir = '';
}
if (subdomain) {
    subdomain = subdomain.substring(0,subdomain.length-1).split('.').join('_').toLowerCase() + '.';
}
config.hosts.muc = 'muc.' + subdomain + 'meet.jitsi';
config.bosh = 'https://localhost:8443/' + subdir + 'http-bind';
config.websocket = 'wss://localhost:8443/' + subdir + 'xmpp-websocket';
config.bridgeChannel = {
    preferSctp: true
};

// Video configuration.
config.resolution = 720;
config.constraints = {
    video: {
        height: { ideal: 720, max: 720, min: 180 },
        width: { ideal: 1280, max: 1280, min: 320},
    }
};

config.startVideoMuted = 10;
config.startWithVideoMuted = false;

config.flags = {
    sourceNameSignaling: true,
    sendMultipleVideoStreams: true,
    receiveMultipleVideoStreams: true
};

// Audio configuration.
config.enableNoAudioDetection = true;
config.enableTalkWhileMuted = false;
config.disableAP = false;
config.disableAGC = false;

config.audioQuality = {
    stereo: false
};

config.startAudioOnly = false;
config.startAudioMuted = 10;
config.startWithAudioMuted = false;
config.startSilent = false;
config.enableOpusRed = false;
config.disableAudioLevels = false;
config.enableNoisyMicDetection = true;

// Peer-to-Peer options.
config.p2p = {
    enabled: true,
    codecPreferenceOrder: ["AV1", "VP9", "VP8", "H264"],
    mobileCodecPreferenceOrder: ["VP8", "VP9", "H264", "AV1"]
};

// Breakout Rooms
config.hideAddRoomButton = false;

// Local recording configuration.
config.localRecording = {
    disable: false,
    notifyAllParticipants: false,
    disableSelfRecording: false
};

// Analytics.
config.analytics = {};

// Calendar service integration.
config.enableCalendarIntegration = false;

// Prejoin page.
config.prejoinConfig = {
    enabled: true,
    hideDisplayName: false
};

// Welcome page.
config.welcomePage = {
    disabled: false
};

// Close page.
config.enableClosePage = false;

// Default language.
config.requireDisplayName = false;

// Chrome extension banner.
config.disableProfile = false;

// Room password (false for anything, number for max digits)
config.roomPasswordNumberOfDigits = false;

// Transcriptions
config.transcription = {
    enabled: false,
    disableClosedCaptions: true,
    translationLanguages: [],
    translationLanguagesHead: ['en'],
    useAppLanguage: true,
    preferredLanguage: 'en-US',
    disableStartForAll: false,
    autoCaptionOnRecord: false,
};

// Dynamic branding
config.deploymentInfo = {};

// Deep Linking
config.disableDeepLinking = false;

// Video quality settings.
config.videoQuality = {};
config.videoQuality.codecPreferenceOrder = ["AV1", "VP9", "VP8", "H264"];
config.videoQuality.mobileCodecPreferenceOrder = ["VP8", "VP9", "H264", "AV1"];
config.videoQuality.enableAdaptiveMode = true;

config.videoQuality.av1 = {};
config.videoQuality.h264 = {};
config.videoQuality.vp8 = {};
config.videoQuality.vp9 = {};

// Reactions
config.disableReactions = false;

// Polls
config.disablePolls = false;

// Configure toolbar buttons
config.remoteVideoMenu = {
    disabled: false,
    disableKick: false,
    disableGrantModerator: false,
    disablePrivateChat: false
};

// Configure e2eping
config.e2eping = {
    enabled: false
};

// Settings for the Excalidraw whiteboard integration.
config.whiteboard = {
    enabled: false,
};

// Disable specific features
config.disableWhiteboard = true;
config.disableShare = true;
config.disableStats = true;
config.disableBroadcast = true;
config.disableRecording = true;
config.disableLiveStreaming = true;

// Disable settings menu options
config.disableSettingsWhiteboard = true;
config.disableSettingsShare = true;
config.disableSettingsStats = true;
config.disableSettingsBroadcast = true;
config.disableSettingsRecording = true;
config.disableSettingsLiveStreaming = true;

// Hide specific settings sections
config.hideWhiteboardSettings = true;
config.hideShareSettings = true;
config.hideStatsSettings = true;
config.hideBroadcastSettings = true;
config.hideRecordingSettings = true;
config.hideLiveStreamingSettings = true;

// Testing
config.testing = {
    enableCodecSelectionAPI: true
};
