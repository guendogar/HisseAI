import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from './useStore';
import { addPrediction, setPredictions, setCurrentPrediction } from '../store/slices/aiSlice';
import { aiDataService } from '../services/ai/aiDataService';
import { predictionEngine } from '../services/ai/predictionEngine';
import { Prediction } from '../types';
import { PredictionPeriod } from '../constants';
import { STORAGE_KEYS } from '../constants';

// ─── Persistence ──────────────────────────────────────────────────────────────

async function loadPredictions(): Promise<Prediction[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.AI_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function savePredictions(predictions: Prediction[]): Promise<void> {
  try {
    // Keep last 200 predictions
    const trimmed = predictions.slice(0, 200);
    await AsyncStorage.setItem(STORAGE_KEYS.AI_REPORTS, JSON.stringify(trimmed));
  } catch {}
}

// ─── Hook: all predictions (for reports) ─────────────────────────────────────

export const useAIReports = () => {
  const dispatch = useAppDispatch();
  const predictions = useAppSelector(s => s.ai.predictions);
  const stats = useAppSelector(s => s.ai.stats);

  useEffect(() => {
    loadPredictions().then(data => {
      if (data.length) dispatch(setPredictions(data));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAll = useCallback(async () => {
    dispatch(setPredictions([]));
    await AsyncStorage.removeItem(STORAGE_KEYS.AI_REPORTS);
  }, [dispatch]);

  return { predictions, stats, clearAll };
};

// ─── Hook: per-stock prediction ───────────────────────────────────────────────

export const useAIPrediction = (stockId: string, symbol: string) => {
  const dispatch = useAppDispatch();
  const allPredictions = useAppSelector(s => s.ai.predictions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  // Latest prediction for this symbol
  const history = allPredictions.filter(p => p.symbol === symbol);

  // Hydrate on mount
  useEffect(() => {
    loadPredictions().then(data => {
      if (data.length) dispatch(setPredictions(data));
      const latest = data.find(p => p.symbol === symbol) ?? null;
      setPrediction(latest);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  const predict = useCallback(
    async (period: PredictionPeriod) => {
      setLoading(true);
      setError(null);
      try {
        const ctx = await aiDataService.getAIContext(stockId, symbol);
        const result = predictionEngine.predict(ctx, period);

        dispatch(addPrediction(result));
        dispatch(setCurrentPrediction(result));
        setPrediction(result);

        // Persist
        const existing = await loadPredictions();
        await savePredictions([result, ...existing]);

        return result;
      } catch (e: any) {
        const msg = e?.message ?? 'Tahmin yapılamadı';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [stockId, symbol, dispatch],
  );

  return { prediction, history, loading, error, predict };
};
