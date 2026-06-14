import { useEffect, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from './useStore';
import { setStocks, setLoading, setError } from '../store/slices/stocksSlice';
import { stockService } from '../services/api/stockService';
import { Market } from '../constants';
import { Stock } from '../types';
import { handleError } from '../utils';

export const useStocks = (market: Market) => {
  const dispatch = useAppDispatch();

  // Selector'ı iki adıma böl → her render'da yeni array oluşturma uyarısını önle
  const ids = useAppSelector(s => s.stocks.lists[market] ?? []);
  const items = useAppSelector(s => s.stocks.items);
  const stocks = useMemo(
    () => ids.map(id => items[id]).filter(Boolean) as Stock[],
    [ids, items],
  );

  const loading = useAppSelector(s => s.stocks.loading);
  const error = useAppSelector(s => s.stocks.error);

  const load = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await stockService.getStocksByMarket(market);
      dispatch(setStocks({ market, stocks: data }));
    } catch (err) {
      dispatch(setError(handleError(err)));
    } finally {
      dispatch(setLoading(false));
    }
  }, [market]);

  useEffect(() => { load(); }, [market]);

  return { stocks, loading, error, refresh: load };
};

export const useStockSearch = () => {
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setSearchLoading] = useState(false);

  const search = useCallback(async (query: string, market?: Market) => {
    if (!query.trim()) { setResults([]); return; }
    setSearchLoading(true);
    try {
      const data = await stockService.searchStocks(query, market);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clear = useCallback(() => setResults([]), []);

  return { results, loading, search, clear };
};

export const useMarketMovers = (market?: Market) => {
  const [gainers, setGainers] = useState<Stock[]>([]);
  const [losers, setLosers] = useState<Stock[]>([]);
  const [active, setActive] = useState<Stock[]>([]);
  const [loading, setMoversLoading] = useState(false);

  const load = useCallback(async () => {
    setMoversLoading(true);
    try {
      const [g, l, a] = await Promise.all([
        stockService.getTopGainers(market),
        stockService.getTopLosers(market),
        stockService.getMostActive(market),
      ]);
      setGainers(g);
      setLosers(l);
      setActive(a);
    } catch {} finally {
      setMoversLoading(false);
    }
  }, [market]);

  useEffect(() => { load(); }, [market]);

  return { gainers, losers, active, loading, refresh: load };
};
