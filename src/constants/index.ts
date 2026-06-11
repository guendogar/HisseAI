// Stock Markets
export const MARKETS = {
  BIST: 'BIST',
  NASDAQ: 'NASDAQ',
  NYSE: 'NYSE',
  EUROPE: 'EUROPE',
} as const;

export type Market = keyof typeof MARKETS;

// API
export const API_TIMEOUT = 15000;
export const WEBSOCKET_RECONNECT_DELAY = 3000;
export const WEBSOCKET_MAX_RETRIES = 5;
export const CACHE_TTL_PRICES = 60;       // seconds
export const CACHE_TTL_NEWS = 300;        // seconds
export const CACHE_TTL_HISTORY = 3600;   // seconds

// Pagination
export const PAGE_SIZE = 50;

// AI
export const AI_PREDICTION_PERIODS = ['1D', '1W', '1M'] as const;
export type PredictionPeriod = typeof AI_PREDICTION_PERIODS[number];

export const PREDICTION_RESULTS = {
  BULLISH: 'BULLISH',
  BEARISH: 'BEARISH',
  NEUTRAL: 'NEUTRAL',
} as const;

export type PredictionResult = keyof typeof PREDICTION_RESULTS;

// Storage Keys
export const STORAGE_KEYS = {
  FAVORITES: '@hisse_favorites',
  WATCHLISTS: '@hisse_watchlists',
  AI_REPORTS: '@hisse_ai_reports',
  PRICE_ALERTS: '@hisse_price_alerts',
  NOTIFICATION_PREFS: '@hisse_notif_prefs',
  AUTH_TOKEN: '@hisse_auth_token',
  REFRESH_TOKEN: '@hisse_refresh_token',
  USER: '@hisse_user',
  THEME: '@hisse_theme',
  AI_CACHE: '@hisse_ai_cache',
  SETTINGS: '@hisse_settings',
};

// Technical Indicators
export const TECHNICAL_INDICATORS = ['RSI', 'MACD', 'EMA', 'SMA', 'Volume'] as const;
export type TechnicalIndicator = typeof TECHNICAL_INDICATORS[number];
