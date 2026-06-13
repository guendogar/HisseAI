// ─── Environment Config ───────────────────────────────────────────────────────

export const Config = {
  // Backend API
  API_BASE_URL: 'https://backend-f998.onrender.com/api/v1',
  WS_BASE_URL: 'wss://backend-f998.onrender.com',

  // External Data APIs (keys managed via env/backend)
  YAHOO_FINANCE_PROXY: 'https://backend-f998.onrender.com/api/v1/market',
  NEWS_API_PROXY: 'https://backend-f998.onrender.com/api/v1/news',

  // Cache
  ENABLE_CACHE: true,

  // Feature Flags
  ENABLE_AI_PREDICTIONS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_WEBSOCKET: false, // Backend hazır olunca true yapın
  USE_MOCK_API: false,      // Backend hazır olunca false yapın

  // Versioning
  APP_VERSION: '1.0.0',
  API_VERSION: 'v1',
  
  // Timeout
  API_TIMEOUT: 15000,
};
