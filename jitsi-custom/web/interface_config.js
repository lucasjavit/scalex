/* eslint-disable no-unused-vars, no-var, max-len */
/* eslint sort-keys: ["error", "asc", {"caseSensitive": false}] */

/**
 * ScaleX Custom Interface Configuration
 */

var interfaceConfig = {
    APP_NAME: 'ScaleX Meet',
    AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)',
    AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)',

    AUTO_PIN_LATEST_SCREEN_SHARE: 'remote-only',
    BRAND_WATERMARK_LINK: 'https://scalex.com',

    CLOSE_PAGE_GUEST_HINT: false,

    DEFAULT_BACKGROUND: '#040404',
    DEFAULT_WELCOME_PAGE_LOGO_URL: 'images/watermark.png',

    DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
    DISABLE_PRESENCE_STATUS: false,
    DISABLE_TRANSCRIPTION_SUBTITLES: false,
    DISABLE_VIDEO_BACKGROUND: false,

    DISPLAY_WELCOME_FOOTER: true,
    DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
    DISPLAY_WELCOME_PAGE_CONTENT: false,
    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,

    ENABLE_DIAL_OUT: true,
    FILM_STRIP_MAX_HEIGHT: 120,
    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: true,
    HIDE_INVITE_MORE_HEADER: false,

    JITSI_WATERMARK_LINK: 'https://scalex.com',

    LANG_DETECTION: true,
    LOCAL_THUMBNAIL_RATIO: 16 / 9,

    MAXIMUM_ZOOMING_COEFFICIENT: 1.3,
    MOBILE_APP_PROMO: true,

    OPTIMAL_BROWSERS: [ 'chrome', 'chromium', 'firefox', 'electron', 'safari', 'webkit' ],

    POLICY_LOGO: null,
    PROVIDER_NAME: 'ScaleX',

    RECENT_LIST_ENABLED: true,
    REMOTE_THUMBNAIL_RATIO: 1,

    SETTINGS_SECTIONS: [ 'devices', 'language', 'moderator', 'profile', 'sounds' ],

    SHOW_BRAND_WATERMARK: true,
    SHOW_CHROME_EXTENSION_BANNER: false,
    SHOW_JITSI_WATERMARK: false,
    SHOW_POWERED_BY: false,
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,

    SUPPORT_URL: 'https://scalex.com/',
    UNSUPPORTED_BROWSERS: [],
    VERTICAL_FILMSTRIP: true,
    VIDEO_LAYOUT_FIT: 'both',
    VIDEO_QUALITY_LABEL_DISABLED: false,

    // Disable specific features
    DISABLE_WHITEBOARD: true,
    DISABLE_SHARE: true,
    DISABLE_STATS: true,
    DISABLE_BROADCAST: true,
    DISABLE_RECORDING: true,
    DISABLE_LIVE_STREAMING: true,
    
    // Disable settings menu options
    DISABLE_SETTINGS_WHITEBOARD: true,
    DISABLE_SETTINGS_SHARE: true,
    DISABLE_SETTINGS_STATS: true,
    DISABLE_SETTINGS_BROADCAST: true,
    DISABLE_SETTINGS_RECORDING: true,
    DISABLE_SETTINGS_LIVE_STREAMING: true,
    
    // Hide specific settings sections
    HIDE_WHITEBOARD_SETTINGS: true,
    HIDE_SHARE_SETTINGS: true,
    HIDE_STATS_SETTINGS: true,
    HIDE_BROADCAST_SETTINGS: true,
    HIDE_RECORDING_SETTINGS: true,
    HIDE_LIVE_STREAMING_SETTINGS: true,

    makeJsonParserHappy: 'even if last key had a trailing comma'
};
