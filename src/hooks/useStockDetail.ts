import { useState, useCallback, useEffect } from 'react';
import { stockService } from '../services/api/stockService';
import { Stock, StockHistory } from '../types';
import { handleError } from '../utils';

type Period = '1D' | '1W' | '1M' | '1Y';

const INTERVAL_MAP: Record<Period, '5m' | '15m' | '1h' | '1d'> = {
  '1D': '5m',
  '1W': '15m',
  '1M': '1h',
  '1Y': '1d',
};

export const useStockDetail = (stockId: string) => {
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stockData, priceData] = await Promise.all([
        stockService.getStockById(stockId),
        stockService.getPrice(stockId),
      ]);
      setStock({ ...stockData, price: priceData });
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, [stockId]);

  useEffect(() => { load(); }, [stockId]);

  return { stock, loading, error, refresh: load };
};

export const useStockHistory = (symbol: string) => {
  const [period, setPeriod] = useState<Period>('1D');
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const data = await stockService.getHistory(symbol, p, INTERVAL_MAP[p]);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => { load(period); }, [period, symbol]);

  const changePeriod = useCallback((p: Period) => {
    setPeriod(p);
  }, []);

  return { history, loading, period, changePeriod };
};
