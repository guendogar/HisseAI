import { Stock, StockHistory, TechnicalIndicators, NewsArticle } from '../../types';
import { stockService } from '../api/stockService';
import { newsService } from '../api/newsService';
import { cache } from '../cache';

// ─── Technical Indicator Calculations ───────────────────────────────────────

function calcSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calcEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calcMACD(
  prices: number[],
): { value: number; signal: number; histogram: number } {
  const ema12 = calcEMA(prices, 12);
  const ema26 = calcEMA(prices, 26);
  const value = ema12 - ema26;
  // Signal: EMA9 of MACD line (approximate with last 9 values of sliding MACD)
  const macdLine: number[] = [];
  for (let i = Math.max(0, prices.length - 35); i < prices.length; i++) {
    const slice = prices.slice(0, i + 1);
    macdLine.push(calcEMA(slice, 12) - calcEMA(slice, 26));
  }
  const signal = calcEMA(macdLine, 9);
  return { value, signal, histogram: value - signal };
}

// ─── Advanced Indicator Calculations ─────────────────────────────────────────

function calcVolatility(prices: number[], period = 20): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  const avg = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  return avg > 0 ? (stdDev / avg) * 100 : 0; // Coefficient of variation
}

function calcTrendStrength(closes: number[], ema20: number, ema50: number, sma20: number, sma50: number): number {
  if (closes.length < 50) return 0;
  const price = closes[closes.length - 1];
  
  // Trend signals: -100 (strong downtrend) to +100 (strong uptrend)
  let signals = 0;
  let totalSignals = 0;
  
  // Price vs EMA
  if (price > ema20 && ema20 > ema50) signals += 2;
  else if (price < ema20 && ema20 < ema50) signals -= 2;
  else if (price > ema20) signals += 1;
  else if (price < ema20) signals -= 1;
  totalSignals += 2;
  
  // EMA vs SMA
  if (ema20 > sma20 && sma20 > sma50) signals += 2;
  else if (ema20 < sma20 && sma20 < sma50) signals -= 2;
  else if (ema20 > sma20) signals += 1;
  else if (ema20 < sma20) signals -= 1;
  totalSignals += 2;
  
  // Price trend (last 20 vs 50 days)
  const prev20Avg = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const prev50Avg = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
  if (price > prev20Avg && prev20Avg > prev50Avg) signals += 2;
  else if (price < prev20Avg && prev20Avg < prev50Avg) signals -= 2;
  totalSignals += 2;
  
  return totalSignals > 0 ? (signals / totalSignals) * 100 : 0;
}

function calcMomentumStrength(rsi: number, macd: { value: number; signal: number }): number {
  // Momentum strength: 0-100
  let strength = 0;
  
  // RSI component (0-50)
  if (rsi > 50) strength += (rsi - 50) / 2; // 0-25
  else strength -= (50 - rsi) / 2; // -25 to 0
  strength += 25; // Shift to 0-50
  
  // MACD component (0-50)
  if (Math.abs(macd.value) > Math.abs(macd.signal)) {
    strength += Math.min(25, Math.abs(macd.value - macd.signal) * 10);
  } else {
    strength += Math.max(-25, -Math.abs(macd.value - macd.signal) * 10);
  }
  strength += 25; // Shift to 0-50
  
  return Math.max(0, Math.min(100, strength));
}

function calcSupportResistance(history: StockHistory[]): { support: number; resistance: number } {
  if (history.length < 20) {
    const current = history[history.length - 1]?.close ?? 0;
    return { support: current * 0.95, resistance: current * 1.05 };
  }
  
  const lows = history.slice(-50).map(h => h.low);
  const highs = history.slice(-50).map(h => h.high);
  
  const support = Math.min(...lows);
  const resistance = Math.max(...highs);
  
  return { support, resistance };
}

function calcBollingerBands(prices: number[], period = 20, stdDevs = 2): { upper: number; middle: number; lower: number; width: number } {
  if (prices.length < period) {
    const current = prices[prices.length - 1] ?? 0;
    return { upper: current * 1.05, middle: current, lower: current * 0.95, width: current * 0.1 };
  }
  
  const slice = prices.slice(-period);
  const middle = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: middle + stdDevs * stdDev,
    middle,
    lower: middle - stdDevs * stdDev,
    width: 2 * stdDevs * stdDev,
  };
}

function calcIndicators(history: StockHistory[], currentVolume: number, avgVolume: number): TechnicalIndicators {
  const closes = history.map(h => h.close);
  const rsi = calcRSI(closes);
  const macd = calcMACD(closes);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const sma20 = calcSMA(closes, 20);
  const sma50 = calcSMA(closes, 50);
  
  // Advanced indicators
  const volatility = calcVolatility(closes);
  const trendStrength = calcTrendStrength(closes, ema20, ema50, sma20, sma50);
  const momentumStrength = calcMomentumStrength(rsi, macd);
  const { support, resistance } = calcSupportResistance(history);
  const bollingerBands = calcBollingerBands(closes);
  
  // Volume change
  const volumeChange = avgVolume > 0 ? ((currentVolume - avgVolume) / avgVolume) * 100 : 0;
  
  return {
    rsi,
    macd,
    ema20,
    ema50,
    sma20,
    sma50,
    volume: currentVolume,
    avgVolume,
    volatility,
    trendStrength,
    momentumStrength,
    support,
    resistance,
    bollingerBands,
    volumeChange,
  };
}

// ─── AI Data Context ─────────────────────────────────────────────────────────

export interface AIDataContext {
  stock: Stock;
  history: StockHistory[];
  indicators: TechnicalIndicators;
  news: NewsArticle[];
  sentimentSummary: {
    positive: number;
    negative: number;
    neutral: number;
    avgScore: number;
  };
  dataQuality: {
    historyPoints: number;
    newsCount: number;
    hasIndicators: boolean;
    score: number; // 0-100
  };
  fetchedAt: number;
}

// ─── AI Data Service ─────────────────────────────────────────────────────────

export const aiDataService = {
  async getAIContext(stockId: string, symbol: string): Promise<AIDataContext> {
    const cacheKey = `ai:context:${symbol}`;
    const cached = cache.get<AIDataContext>(cacheKey);
    if (cached) return cached;

    let stock: Stock;
    let history: StockHistory[] = [];
    let news: NewsArticle[] = [];

    try {
      // Parallel fetch with 8-second hard timeout
      const results = await Promise.race([
        Promise.all([
          stockService.getStockById(stockId),
          stockService.getHistory(symbol, '1Y', '1d'),
          newsService.getTopNewsBySymbol(symbol, 20),
        ]),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI veri zaman aşımı')), 8000),
        ),
      ]);
      [stock, history, news] = results as [Stock, StockHistory[], NewsArticle[]];
    } catch {
      // Fallback: minimum context so the prediction engine can still run
      stock = await stockService.getStockById(stockId).catch(() => ({
        id: stockId, symbol, name: symbol, market: 'BIST' as any,
        currency: 'TRY',
        sector: '', description: '',
      }));
      history = [];
      news = [];
    }

    const price = stock.price;
    const indicators = calcIndicators(
      history,
      price?.volume ?? 0,
      price?.avgVolume ?? 0,
    );
    const sentimentSummary = newsService.analyzeArticles(news);

    const historyPoints = history.length;
    const newsCount = news.length;
    const hasIndicators = historyPoints >= 26;
    const qualityScore = Math.min(
      100,
      (Math.min(historyPoints, 200) / 200) * 50 +
      (Math.min(newsCount, 20) / 20) * 30 +
      (hasIndicators ? 20 : 0),
    );

    const ctx: AIDataContext = {
      stock,
      history,
      indicators,
      news,
      sentimentSummary,
      dataQuality: { historyPoints, newsCount, hasIndicators, score: Math.round(qualityScore) },
      fetchedAt: Date.now(),
    };

    cache.set(cacheKey, ctx, 300);
    return ctx;
  },

  // Lightweight re-compute indicators without re-fetching
  recomputeIndicators(history: StockHistory[], volume: number, avgVolume: number): TechnicalIndicators {
    return calcIndicators(history, volume, avgVolume);
  },
};
