import { Market, PredictionResult, PredictionPeriod } from '../constants';

// ─── Stock ───────────────────────────────────────────────────────────────────

export interface StockPrice {
  current: number;
  open: number;
  high: number;
  low: number;
  close: number;
  previousClose: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap?: number;
  timestamp: number;
}

export interface StockHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  market: Market;
  sector?: string;
  currency: string;
  logo?: string;
  description?: string;
  price?: StockPrice;
  weeklyChange?: number;
  monthlyChange?: number;
  isFavorite?: boolean;
}

// ─── News ────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  relatedSymbols: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  category: string;
  imageUrl?: string;
}

// ─── AI / Prediction ─────────────────────────────────────────────────────────

export interface TechnicalIndicators {
  // Momentum Indicators
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  
  // Trend Indicators
  ema20: number;
  ema50: number;
  sma20: number;
  sma50: number;
  
  // Volume Indicators
  volume: number;
  avgVolume: number;
  volumeChange?: number;
  
  // Advanced Indicators
  volatility?: number;           // Standard deviation / Average price
  trendStrength?: number;        // -100 to 100 (downtrend to uptrend)
  momentumStrength?: number;     // 0 to 100 (momentum intensity)
  
  // Support/Resistance (optional)
  support?: number;
  resistance?: number;
  
  // Bollinger Bands (optional)
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
    width: number;
  };
}

export interface PredictionReason {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface Prediction {
  id: string;
  stockId: string;
  symbol: string;
  period: PredictionPeriod;
  result: PredictionResult;
  confidenceScore: number;
  riskScore: number;
  reasons: PredictionReason[];
  dataPointsUsed: number;
  newsCount: number;
  createdAt: string;
  actualResult?: PredictionResult;
  isCorrect?: boolean;
  resolvedAt?: string;
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export interface WatchList {
  id: string;
  name: string;
  symbols: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface NotificationPrefs {
  priceAlerts: boolean;
  aiPredictions: boolean;
  news: boolean;
  watchlist: boolean;
  silentMode: boolean;
}

export interface AppNotification {
  id: string;
  type: 'price_alert' | 'ai_prediction' | 'news' | 'watchlist';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ─── API Generic ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}
