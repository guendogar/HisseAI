// ─── Stock Service (Mock Mode) ────────────────────────────────────────────────
// USE_MOCK = true olduğunda tüm API çağrıları mock verilerle karşılanır.

import { Stock, StockPrice, StockHistory } from '../../types';
import { Market } from '../../constants';
import { cache, CacheKeys, CacheTTL } from '../cache';
import { MOCK_STOCKS, generateMockHistory } from './mockData';

const USE_MOCK = true; // Backend hazır olunca false yapın

// ─── Mock Helpers ─────────────────────────────────────────────────────────────

function mockGetStocksByMarket(market: Market): Stock[] {
  return MOCK_STOCKS.filter(s => s.market === market);
}

function mockSearchStocks(query: string, market?: Market): Stock[] {
  const q = query.toLowerCase();
  return MOCK_STOCKS.filter(s =>
    (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) &&
    (!market || s.market === market),
  );
}

function mockGetStocksByMarketAndSector(market: Market, sector: string): Stock[] {
  return MOCK_STOCKS.filter(s => s.market === market && s.sector?.toLowerCase() === sector.toLowerCase());
}

function mockGetStocksBySector(sector: string): Stock[] {
  return MOCK_STOCKS.filter(s => s.sector?.toLowerCase() === sector.toLowerCase());
}

function mockGetAllSectors(market?: Market): string[] {
  const stocks = market ? MOCK_STOCKS.filter(s => s.market === market) : MOCK_STOCKS;
  const sectors = new Set<string>();
  stocks.forEach(s => {
    if (s.sector) sectors.add(s.sector);
  });
  return Array.from(sectors).sort();
}

function mockGetStockById(id: string): Stock {
  const found = MOCK_STOCKS.find(s => s.id === id);
  if (!found) throw new Error(`Hisse bulunamadı: ${id}`);
  return found;
}

function mockGetPrice(symbol: string): StockPrice {
  const stock = MOCK_STOCKS.find(s => s.symbol === symbol);
  if (!stock?.price) throw new Error(`Fiyat bulunamadı: ${symbol}`);
  return stock.price;
}

function mockGetBatchPrices(symbols: string[]): Record<string, StockPrice> {
  const result: Record<string, StockPrice> = {};
  for (const sym of symbols) {
    const stock = MOCK_STOCKS.find(s => s.symbol === sym);
    if (stock?.price) result[sym] = stock.price;
  }
  return result;
}

function mockGetHistory(symbol: string): StockHistory[] {
  const stock = MOCK_STOCKS.find(s => s.symbol === symbol);
  const base = stock?.price?.current ?? 100;
  return generateMockHistory(base, 365);
}

function mockGetMovers(sort: 'gain' | 'loss' | 'volume', market?: Market, limit = 10): Stock[] {
  let list = market ? MOCK_STOCKS.filter(s => s.market === market) : [...MOCK_STOCKS];
  list = list.sort((a, b) => {
    if (sort === 'gain') return (b.price?.changePercent ?? 0) - (a.price?.changePercent ?? 0);
    if (sort === 'loss') return (a.price?.changePercent ?? 0) - (b.price?.changePercent ?? 0);
    return (b.price?.volume ?? 0) - (a.price?.volume ?? 0);
  });
  return list.slice(0, limit);
}

// ─── Async wrapper (simulates network delay) ──────────────────────────────────

function mockAsync<T>(fn: () => T, delayMs = 300): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      try { resolve(fn()); } catch (e) { reject(e); }
    }, delayMs),
  );
}

// ─── Public Service ───────────────────────────────────────────────────────────

export const stockService = {
  async getAllStocks(): Promise<Stock[]> {
    const key = CacheKeys.stockList('ALL');
    const cached = cache.get<Stock[]>(key);
    if (cached) return cached;

    const data = USE_MOCK
      ? await mockAsync(() => [...MOCK_STOCKS])
      : await (await import('./client')).apiClient.get<Stock[]>('/stocks');

    cache.set(key, data, CacheTTL.history);
    return data;
  },

  async getStocksByMarket(market: Market): Promise<Stock[]> {
    const key = CacheKeys.stockList(market);
    const cached = cache.get<Stock[]>(key);
    if (cached) return cached;

    const data = USE_MOCK
      ? await mockAsync(() => mockGetStocksByMarket(market))
      : await (await import('./client')).apiClient.get<Stock[]>(`/stocks?market=${market}`);

    cache.set(key, data, CacheTTL.history);
    return data;
  },

  async searchStocks(query: string, market?: Market): Promise<Stock[]> {
    if (USE_MOCK) return mockAsync(() => mockSearchStocks(query, market));
    const { apiClient } = await import('./client');
    const params = new URLSearchParams({ q: query });
    if (market) params.set('market', market);
    return apiClient.get<Stock[]>(`/stocks/search?${params.toString()}`);
  },

  async getStockById(id: string): Promise<Stock> {
    const cached = cache.get<Stock>(`stock:${id}`);
    if (cached) return cached;

    const data = USE_MOCK
      ? await mockAsync(() => mockGetStockById(id))
      : await (await import('./client')).apiClient.get<Stock>(`/stocks/${id}`);

    cache.set(`stock:${id}`, data, CacheTTL.prices);
    return data;
  },

  async getPrice(symbol: string): Promise<StockPrice> {
    const key = CacheKeys.stockPrice(symbol);
    const cached = cache.get<StockPrice>(key);
    if (cached) return cached;

    const data = USE_MOCK
      ? await mockAsync(() => mockGetPrice(symbol))
      : await (await import('./client')).apiClient.get<StockPrice>(`/stocks/${symbol}/price`);

    cache.set(key, data, CacheTTL.prices);
    return data;
  },

  async getBatchPrices(symbols: string[]): Promise<Record<string, StockPrice>> {
    if (USE_MOCK) return mockAsync(() => mockGetBatchPrices(symbols));
    const { apiClient } = await import('./client');
    return apiClient.get<Record<string, StockPrice>>(`/stocks/prices/batch?symbols=${symbols.join(',')}`);
  },

  async getHistory(
    symbol: string,
    period: '1D' | '1W' | '1M' | '1Y' | 'ALL',
    interval: '1m' | '5m' | '15m' | '1h' | '1d' = '1d',
  ): Promise<StockHistory[]> {
    const key = CacheKeys.stockHistory(symbol, `${period}_${interval}`);
    const cached = cache.get<StockHistory[]>(key);
    if (cached) return cached;

    const data = USE_MOCK
      ? await mockAsync(() => mockGetHistory(symbol), 200)
      : await (await import('./client')).apiClient.get<StockHistory[]>(
          `/stocks/${symbol}/history?period=${period}&interval=${interval}`,
        );

    cache.set(key, data, CacheTTL.history);
    return data;
  },

  async getTopGainers(market?: Market, limit = 10): Promise<Stock[]> {
    if (USE_MOCK) return mockAsync(() => mockGetMovers('gain', market, limit));
    const { apiClient } = await import('./client');
    const params = new URLSearchParams({ sort: 'change_desc', limit: String(limit) });
    if (market) params.set('market', market);
    return apiClient.get<Stock[]>(`/stocks/movers/gainers?${params.toString()}`);
  },

  async getTopLosers(market?: Market, limit = 10): Promise<Stock[]> {
    if (USE_MOCK) return mockAsync(() => mockGetMovers('loss', market, limit));
    const { apiClient } = await import('./client');
    const params = new URLSearchParams({ sort: 'change_asc', limit: String(limit) });
    if (market) params.set('market', market);
    return apiClient.get<Stock[]>(`/stocks/movers/losers?${params.toString()}`);
  },

  async getMostActive(market?: Market, limit = 10): Promise<Stock[]> {
    if (USE_MOCK) return mockAsync(() => mockGetMovers('volume', market, limit));
    const { apiClient } = await import('./client');
    const params = new URLSearchParams({ sort: 'volume_desc', limit: String(limit) });
    if (market) params.set('market', market);
    return apiClient.get<Stock[]>(`/stocks/movers/active?${params.toString()}`);
  },

  async getStocksBySector(sector: string, market?: Market): Promise<Stock[]> {
    if (USE_MOCK) {
      return mockAsync(() =>
        market
          ? mockGetStocksByMarketAndSector(market, sector)
          : mockGetStocksBySector(sector),
      );
    }
    const { apiClient } = await import('./client');
    const params = new URLSearchParams({ sector });
    if (market) params.set('market', market);
    return apiClient.get<Stock[]>(`/stocks/by-sector?${params.toString()}`);
  },

  async getAllSectors(market?: Market): Promise<string[]> {
    if (USE_MOCK) return mockAsync(() => mockGetAllSectors(market));
    const { apiClient } = await import('./client');
    const params = new URLSearchParams();
    if (market) params.set('market', market);
    return apiClient.get<string[]>(`/stocks/sectors?${params.toString()}`);
  },
};
