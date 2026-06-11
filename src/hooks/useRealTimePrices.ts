import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch } from './useStore';
import { priceUpdate } from '../store/slices/stocksSlice';
import { wsManager } from '../services/websocket';
import { StockPrice } from '../types';
import { Config } from '../config';

export const useRealTimePrices = (symbols: string[]) => {
  const dispatch = useAppDispatch();
  const symbolsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!Config.ENABLE_WEBSOCKET || symbols.length === 0) return;

    // Connect if not already
    wsManager.connect();

    // Subscribe to new symbols
    const newSymbols = symbols.filter(s => !symbolsRef.current.includes(s));
    const removedSymbols = symbolsRef.current.filter(s => !symbols.includes(s));

    if (newSymbols.length > 0) wsManager.subscribe(newSymbols);
    if (removedSymbols.length > 0) wsManager.unsubscribe(removedSymbols);

    symbolsRef.current = symbols;

    const unsubPrices = wsManager.onPriceUpdate((symbol: string, price: StockPrice) => {
      dispatch(priceUpdate({ id: symbol, price }));
    });

    return () => {
      unsubPrices();
      wsManager.unsubscribe(symbols);
    };
  }, [symbols.join(',')]);
};

export const useWebSocketStatus = () => {
  const statusRef = useRef<'connected' | 'disconnected' | 'error'>('disconnected');

  useEffect(() => {
    const unsub = wsManager.onConnectionChange(status => {
      statusRef.current = status;
    });
    return unsub;
  }, []);

  return { isConnected: wsManager.isConnected };
};
