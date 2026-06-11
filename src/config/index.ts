// ─── Environment Config ───────────────────────────────────────────────────────

export const Config = {
  // Backend API
  API_BASE_URL: 'http://localhost:3000/api/v1',
  WS_BASE_URL: 'ws://localhost:3000',

  // External Data APIs (keys managed via env/backend)
  YAHOO_FINANCE_PROXY: 'http://localhost:3000/api/v1/market',
  NEWS_API_PROXY: 'http://localhost:3000/api/v1/news',

  // Cache
  ENABLE_CACHE: true,

  // Feature Flags
  ENABLE_AI_PREDICTIONS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_WEBSOCKET: false, // Backend hazır olunca true yapın
  USE_MOCK_API: true,      // Backend hazır olunca false yapın

  // Versioning
  APP_VERSION: '1.0.0',
  API_VERSION: 'v1',
  
  // Timeout
  API_TIMEOUT: 15000,
};
