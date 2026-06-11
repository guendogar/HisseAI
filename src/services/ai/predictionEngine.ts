import { Prediction, PredictionReason } from '../../types';
import { PredictionPeriod, PredictionResult } from '../../constants';
import { AIDataContext } from './aiDataService';
import { generateId } from '../../utils';

// ─── Scoring Weights ─────────────────────────────────────────────────────────

const WEIGHTS = {
  rsi: 0.15,
  macd: 0.15,
  ema: 0.12,
  sma: 0.10,
  trend: 0.12,
  momentum: 0.10,
  volume: 0.08,
  support: 0.06,
  sentiment: 0.12,
};

// ─── Signal helpers ──────────────────────────────────────────────────────────

function rsiSignal(rsi: number): { score: number; description: string } {
  if (rsi > 70) return { score: -0.8, description: `RSI aşırı alım bölgesinde (${rsi.toFixed(1)}) — düşüş baskısı` };
  if (rsi > 60) return { score: -0.3, description: `RSI yüksek seviyelerde (${rsi.toFixed(1)})` };
  if (rsi < 30) return { score: 0.8, description: `RSI aşırı satım bölgesinde (${rsi.toFixed(1)}) — toparlanma sinyali` };
  if (rsi < 40) return { score: 0.3, description: `RSI düşük seviyelerde (${rsi.toFixed(1)}) — alım fırsatı olabilir` };
  return { score: 0, description: `RSI nötr bölgede (${rsi.toFixed(1)})` };
}

function macdSignal(macd: { value: number; signal: number; histogram: number }): {
  score: number;
  description: string;
} {
  if (macd.histogram > 0 && macd.value > 0)
    return { score: 0.7, description: `MACD pozitif histogram — yükseliş momentumu güçlü` };
  if (macd.histogram > 0)
    return { score: 0.3, description: `MACD sinyalin üzerinde — yükseliş eğilimi başlıyor` };
  if (macd.histogram < 0 && macd.value < 0)
    return { score: -0.7, description: `MACD negatif histogram — düşüş momentumu güçlü` };
  return { score: -0.3, description: `MACD sinyalin altında — zayıflama sinyali` };
}

function emaSignal(price: number, ema20: number, ema50: number): { score: number; description: string } {
  if (price > ema20 && ema20 > ema50)
    return { score: 0.7, description: `Fiyat EMA20 ve EMA50 üzerinde — güçlü yükseliş trendi` };
  if (price > ema20)
    return { score: 0.3, description: `Fiyat EMA20 üzerinde — kısa vadeli trend pozitif` };
  if (price < ema20 && ema20 < ema50)
    return { score: -0.7, description: `Fiyat EMA20 ve EMA50 altında — güçlü düşüş trendi` };
  return { score: -0.3, description: `Fiyat EMA20 altında — kısa vadeli trend negatif` };
}

function smaSignal(price: number, sma20: number, sma50: number): { score: number; description: string } {
  if (price > sma20 && sma20 > sma50)
    return { score: 0.6, description: `Fiyat SMA20/50 üzerinde — uzun vadeli trend güçlü` };
  if (price > sma50)
    return { score: 0.2, description: `Fiyat SMA50 üzerinde — orta vadeli trend pozitif` };
  if (price < sma20 && sma20 < sma50)
    return { score: -0.6, description: `Fiyat SMA20/50 altında — uzun vadeli trend zayıf` };
  return { score: -0.2, description: `Fiyat SMA50 altında — orta vadeli trend negatif` };
}

function volumeSignal(volume: number, avgVolume: number): { score: number; description: string } {
  const ratio = avgVolume > 0 ? volume / avgVolume : 1;
  if (ratio > 2) return { score: 0.5, description: `İşlem hacmi ortalamanın ${ratio.toFixed(1)}x üzerinde — güçlü ilgi` };
  if (ratio > 1.3) return { score: 0.2, description: `İşlem hacmi normalin üzerinde` };
  if (ratio < 0.5) return { score: -0.3, description: `İşlem hacmi çok düşük — ilgisizlik` };
  return { score: 0, description: `İşlem hacmi normal seviyelerde` };
}

function sentimentSignal(avgScore: number, newsCount: number): { score: number; description: string } {
  if (newsCount === 0) return { score: 0, description: 'Haber verisi bulunamadı' };
  if (avgScore > 0.3) return { score: 0.7, description: `Haber sentiment skoru güçlü pozitif (${(avgScore * 100).toFixed(0)}%)` };
  if (avgScore > 0.1) return { score: 0.3, description: `Haber sentiment hafif pozitif` };
  if (avgScore < -0.3) return { score: -0.7, description: `Haber sentiment skoru güçlü negatif (${(avgScore * 100).toFixed(0)}%)` };
  if (avgScore < -0.1) return { score: -0.3, description: `Haber sentiment hafif negatif` };
  return { score: 0, description: `Haber sentiment nötr` };
}

function trendStrengthSignal(strength?: number): { score: number; description: string } {
  if (strength === undefined) return { score: 0, description: 'Trend analizi yapılamadı' };
  if (strength > 50) return { score: 0.7, description: `Güçlü yükseliş trendi (${strength.toFixed(0)}%)` };
  if (strength > 20) return { score: 0.3, description: `Hafif yükseliş trendi` };
  if (strength < -50) return { score: -0.7, description: `Güçlü düşüş trendi (${strength.toFixed(0)}%)` };
  if (strength < -20) return { score: -0.3, description: `Hafif düşüş trendi` };
  return { score: 0, description: `Trend nötr` };
}

function momentumSignal(momentum?: number, strength?: number): { score: number; description: string } {
  if (momentum === undefined || strength === undefined) return { score: 0, description: 'Momentum analizi yapılamadı' };
  if (momentum > 70 && strength > 60) return { score: 0.8, description: `Çok güçlü momentum (${momentum.toFixed(0)}/100)` };
  if (momentum > 50) return { score: 0.4, description: `Güçlü momentum` };
  if (momentum < 30) return { score: -0.4, description: `Zayıf momentum` };
  if (momentum < 20) return { score: -0.8, description: `Çok zayıf momentum` };
  return { score: 0, description: `Momentum nötr` };
}

function supportResistanceSignal(price: number, support?: number, resistance?: number): { score: number; description: string } {
  if (!support || !resistance) return { score: 0, description: 'Destek/Direnç analizi yapılamadı' };
  const distanceToSupport = support > 0 ? ((price - support) / support) * 100 : 100;
  const distanceToResistance = resistance > 0 ? ((resistance - price) / resistance) * 100 : 100;
  
  if (distanceToSupport < 5) return { score: -0.5, description: `Fiyat destek seviyesine yakın — satış baskısı` };
  if (distanceToResistance < 5) return { score: 0.5, description: `Fiyat direnç seviyesine yakın — yükseliş potansiyeli` };
  return { score: 0, description: `Fiyat normal seviyelerde` };
}

// ─── Period risk multiplier ───────────────────────────────────────────────────

const PERIOD_RISK: Record<PredictionPeriod, number> = {
  '1D': 0.7,
  '1W': 0.5,
  '1M': 0.35,
};

// ─── Prediction Engine ───────────────────────────────────────────────────────

export const predictionEngine = {
  predict(ctx: AIDataContext, period: PredictionPeriod): Prediction {
    const { indicators, sentimentSummary, stock, news, dataQuality } = ctx;
    const price = stock.price?.current ?? 0;
    const { rsi, macd, ema20, ema50, sma20, sma50, volume, avgVolume, trendStrength, momentumStrength, support, resistance } = indicators;

    // Calculate individual signals
    const rsiSig = rsiSignal(rsi);
    const macdSig = macdSignal(macd);
    const emaSig = emaSignal(price, ema20, ema50);
    const smaSig = smaSignal(price, sma20, sma50);
    const volSig = volumeSignal(volume, avgVolume);
    const sentSig = sentimentSignal(sentimentSummary.avgScore, news.length);
    const trendSig = trendStrengthSignal(trendStrength);
    const momentumSig = momentumSignal(momentumStrength, trendStrength);
    const supportSig = supportResistanceSignal(price, support, resistance);

    // Weighted composite score (-1 to +1)
    const composite =
      rsiSig.score * WEIGHTS.rsi +
      macdSig.score * WEIGHTS.macd +
      emaSig.score * WEIGHTS.ema +
      smaSig.score * WEIGHTS.sma +
      volSig.score * WEIGHTS.volume +
      sentSig.score * WEIGHTS.sentiment +
      trendSig.score * WEIGHTS.trend +
      momentumSig.score * WEIGHTS.momentum +
      supportSig.score * WEIGHTS.support;

    // Prediction result
    let result: PredictionResult;
    if (composite > 0.15) result = 'BULLISH';
    else if (composite < -0.15) result = 'BEARISH';
    else result = 'NEUTRAL';

    // Confidence: absolute composite normalized 0-100, adjusted by data quality
    const rawConfidence = Math.abs(composite) * 100;
    const confidenceScore = Math.round(
      Math.min(95, rawConfidence * (0.5 + dataQuality.score / 200)),
    );

    // Risk: inversely related to confidence, modulated by period
    const riskScore = Math.round(
      Math.min(95, (100 - confidenceScore) * (1 + PERIOD_RISK[period])),
    );

    // Build reasons (sorted by weight)
    const reasons: PredictionReason[] = [
      {
        factor: 'RSI',
        impact: rsiSig.score > 0 ? 'positive' : rsiSig.score < 0 ? 'negative' : 'neutral',
        weight: WEIGHTS.rsi,
        description: rsiSig.description,
      },
      {
        factor: 'MACD',
        impact: macdSig.score > 0 ? 'positive' : macdSig.score < 0 ? 'negative' : 'neutral',
        weight: WEIGHTS.macd,
        description: macdSig.description,
      },
      {
        factor: 'Trend',
        impact: trendSig.score > 0 ? 'positive' : trendSig.score < 0 ? 'negative' : 'neutral',
        weight: WEIGHTS.trend,
        description: trendSig.description,
      },
      {
        factor: 'Haber Sentiment',
        impact: sentSig.score > 0 ? 'positive' : sentSig.score < 0 ? 'negative' : 'neutral',
        weight: WEIGHTS.sentiment,
        description: sentSig.description,
      },
      {
        factor: 'EMA Trendi',
        impact: emaSig.score > 0 ? 'positive' : emaSig.score < 0 ? 'negative' : 'neutral',
        weight: WEIGHTS.ema,
        description: emaSig.description,
      },
      {
        factor: 'Momentum',
        impact: momentumSig.score > 0 ? 'positive' : momentumSig.score < 0 ? 'negative' : 'neutral',
        weight: WEIGHTS.momentum,
        description: momentumSig.description,
      },
      {
        factor: 'SMA Trendi',
        impact: smaSig.score > 0 ? 'positive' : smaSig.score < 0 ? 'negative' : 'neutral',
        weight: WEIGHTS.sma,
        description: smaSig.description,
      },
      {
        factor: 'Hacim Analizi',
        impact: volSig.score > 0 ? 'positive' : volSig.score < 0 ? 'negative' : 'neutral',
        weight: WEIGHTS.volume,
        description: volSig.description,
      },
      {
        factor: 'Destek/Direnç',
        impact: supportSig.score > 0 ? 'positive' : supportSig.score < 0 ? 'negative' : 'neutral',
        weight: WEIGHTS.support,
        description: supportSig.description,
      },
    ].sort((a, b) => b.weight - a.weight) as PredictionReason[];

    return {
      id: generateId(),
      stockId: stock.id,
      symbol: stock.symbol,
      period,
      result,
      confidenceScore,
      riskScore,
      reasons,
      dataPointsUsed: ctx.dataQuality.historyPoints,
      newsCount: news.length,
      createdAt: new Date().toISOString(),
    };
  },
};
