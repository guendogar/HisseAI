// ─── Daily Prediction Scheduler ───────────────────────────────────────────
// Manages automatic daily stock prediction generation

import { Stock, Prediction } from '../../types';
import { Market, PredictionPeriod } from '../../constants';
import { stockService } from '../api/stockService';
import { predictionEngine } from './predictionEngine';
import { aiDataService } from './aiDataService';
import { cache } from '../cache';
import { generateId } from '../../utils';

// ─── Types ────────────────────────────────────────────────────────────────

export interface DailyPredictionResult {
  date: string;
  predictions: Prediction[];
  bistCount: number;
  internationalCount: number;
  totalCount: number;
  generatedAt: string;
}

export interface PredictionHistory {
  date: string;
  prediction: Prediction;
  actualResult?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  isCorrect?: boolean;
}

// ─── Configuration ────────────────────────────────────────────────────────

const DAILY_CONFIG = {
  bistTarget: 3,
  internationalTarget: 3,
  minConfidenceForBonus: 75, // If high confidence, add more stocks
  bonusStocksPerSignal: 1,
  diversifyByMarket: true,
  avoidRepeatsForDays: 7, // Don't pick same stock within 7 days
};

// ─── Selection Logic ──────────────────────────────────────────────────────

async function selectStocksForPrediction(): Promise<Stock[]> {
  const selected: Stock[] = [];
  const bistStocks = await stockService.getStocksByMarket('BIST');
  const internationalMarkets: Market[] = ['NASDAQ', 'NYSE', 'EUROPE'];
  
  // Track recently selected stocks
  const recentlySelectedKey = 'daily:recentlySelected';
  const recentlySelected = cache.get<Record<string, number>>(recentlySelectedKey) || {};
  const today = new Date().toDateString();
  
  // Clean up old entries (older than 7 days)
  Object.keys(recentlySelected).forEach(key => {
    const [, date] = key.split(':');
    const daysDiff = Math.floor((new Date(today).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > DAILY_CONFIG.avoidRepeatsForDays) {
      delete recentlySelected[key];
    }
  });
  
  // Select BIST stocks
  let bistToSelect = DAILY_CONFIG.bistTarget;
  const availableBist = bistStocks.filter(s => !recentlySelected[`${s.symbol}:${today}`]);
  
  for (let i = 0; i < Math.min(bistToSelect, availableBist.length); i++) {
    // Sort by performance gain for variety
    availableBist.sort((a, b) => (Math.random() - 0.5)); // Simple shuffle
    const stock = availableBist[i];
    selected.push(stock);
    recentlySelected[`${stock.symbol}:${today}`] = 1;
  }
  
  // Select international stocks
  let internationalToSelect = DAILY_CONFIG.internationalTarget;
  const availableIntl: Stock[] = [];
  
  for (const market of internationalMarkets) {
    const stocks = await stockService.getStocksByMarket(market);
    availableIntl.push(...stocks.filter(s => !recentlySelected[`${s.symbol}:${today}`]));
  }
  
  for (let i = 0; i < Math.min(internationalToSelect, availableIntl.length); i++) {
    availableIntl.sort((a, b) => (Math.random() - 0.5)); // Simple shuffle
    const stock = availableIntl[i];
    selected.push(stock);
    recentlySelected[`${stock.symbol}:${today}`] = 1;
  }
  
  // Update cache
  cache.set(recentlySelectedKey, recentlySelected, 86400 * 8); // 8 days TTL
  
  return selected;
}

// ─── Prediction Generation ────────────────────────────────────────────────

export const dailyPredictionScheduler = {
  async generateDailyPredictions(): Promise<DailyPredictionResult> {
    const today = new Date().toDateString();
    const cacheKey = `daily:predictions:${today}`;
    
    // Check if already generated today
    const cached = cache.get<DailyPredictionResult>(cacheKey);
    if (cached) return cached;
    
    const predictions: Prediction[] = [];
    
    try {
      // Select stocks for prediction
      const stocks = await selectStocksForPrediction();
      
      // Generate predictions for each stock
      for (const stock of stocks) {
        try {
          const ctx = await aiDataService.getAIContext(stock.id, stock.symbol);
          const prediction = predictionEngine.predict(ctx, '1D');
          predictions.push(prediction);
        } catch (err) {
          console.warn(`Failed to generate prediction for ${stock.symbol}:`, err);
        }
      }
      
      // Separate by market
      const bistCount = predictions.filter(p => {
        const stock = stocks.find(s => s.id === p.stockId);
        return stock?.market === 'BIST';
      }).length;
      
      const result: DailyPredictionResult = {
        date: today,
        predictions,
        bistCount,
        internationalCount: predictions.length - bistCount,
        totalCount: predictions.length,
        generatedAt: new Date().toISOString(),
      };
      
      // Cache for the day
      cache.set(cacheKey, result, 86400); // 24 hours
      
      // Also store in long-term history
      await this.savePredictionHistory(result);
      
      return result;
    } catch (err) {
      console.error('Failed to generate daily predictions:', err);
      return {
        date: today,
        predictions: [],
        bistCount: 0,
        internationalCount: 0,
        totalCount: 0,
        generatedAt: new Date().toISOString(),
      };
    }
  },

  async getTodaysPredictions(): Promise<Prediction[]> {
    const today = new Date().toDateString();
    const cacheKey = `daily:predictions:${today}`;
    const cached = cache.get<DailyPredictionResult>(cacheKey);
    
    if (cached) {
      return cached.predictions;
    }
    
    const result = await this.generateDailyPredictions();
    return result.predictions;
  },

  async getPredictionHistory(days = 30): Promise<DailyPredictionResult[]> {
    const key = 'prediction:history:all';
    const history = cache.get<DailyPredictionResult[]>(key) || [];
    
    // Return last N days
    return history.slice(-days);
  },

  async savePredictionHistory(result: DailyPredictionResult): Promise<void> {
    const key = 'prediction:history:all';
    const history = cache.get<DailyPredictionResult[]>(key) || [];
    
    // Avoid duplicates
    if (!history.find(h => h.date === result.date)) {
      history.push(result);
      // Keep last 90 days
      if (history.length > 90) {
        history.shift();
      }
      cache.set(key, history, 86400 * 90); // 90 days TTL
    }
  },

  async resolvePrediction(predictionId: string, actualResult: 'BULLISH' | 'BEARISH' | 'NEUTRAL'): Promise<void> {
    // Update prediction with actual result
    const key = 'prediction:history:all';
    const history = cache.get<DailyPredictionResult[]>(key) || [];
    
    for (const day of history) {
      const pred = day.predictions.find(p => p.id === predictionId);
      if (pred) {
        pred.actualResult = actualResult;
        pred.isCorrect = pred.result === actualResult;
        pred.resolvedAt = new Date().toISOString();
        cache.set(key, history, 86400 * 90);
        break;
      }
    }
  },

  async getAccuracyStats(days = 30): Promise<{
    total: number;
    correct: number;
    accuracy: number;
    bullishAccuracy: number;
    bearishAccuracy: number;
    neutralAccuracy: number;
  }> {
    const history = await this.getPredictionHistory(days);
    
    let total = 0;
    let correct = 0;
    let bullishTotal = 0, bullishCorrect = 0;
    let bearishTotal = 0, bearishCorrect = 0;
    let neutralTotal = 0, neutralCorrect = 0;
    
    for (const day of history) {
      for (const pred of day.predictions) {
        if (pred.isCorrect !== undefined) {
          total++;
          if (pred.isCorrect) correct++;
          
          if (pred.result === 'BULLISH') {
            bullishTotal++;
            if (pred.isCorrect) bullishCorrect++;
          } else if (pred.result === 'BEARISH') {
            bearishTotal++;
            if (pred.isCorrect) bearishCorrect++;
          } else {
            neutralTotal++;
            if (pred.isCorrect) neutralCorrect++;
          }
        }
      }
    }
    
    return {
      total,
      correct,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      bullishAccuracy: bullishTotal > 0 ? (bullishCorrect / bullishTotal) * 100 : 0,
      bearishAccuracy: bearishTotal > 0 ? (bearishCorrect / bearishTotal) * 100 : 0,
      neutralAccuracy: neutralTotal > 0 ? (neutralCorrect / neutralTotal) * 100 : 0,
    };
  },
};
