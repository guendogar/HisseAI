// ─── Stock Service – Direkt Yahoo Finance API ─────────────────────────────────
// Backend'e gerek yok. React Native'de CORS olmadığı için direkt çekiyoruz.

import { Stock, StockPrice, StockHistory } from '../../types';
import { Market } from '../../constants';
import { cache, CacheKeys, CacheTTL } from '../cache';

const YF_BASE = 'https://query1.finance.yahoo.com';
const YF_BASE2 = 'https://query2.finance.yahoo.com';

// ─── Sembol Listeleri ─────────────────────────────────────────────────────────

const MARKET_SYMBOLS: Record<string, string[]> = {
  BIST: [
    'THYAO.IS', 'GARAN.IS', 'EREGL.IS', 'AKBNK.IS', 'KCHOL.IS',
    'SASA.IS', 'TUPRS.IS', 'SAHOL.IS', 'BIMAS.IS', 'VESTL.IS',
    'ASELS.IS', 'TCELL.IS', 'YKBNK.IS', 'PGSUS.IS', 'SISE.IS',
  ],
  NASDAQ: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX', 'AMD', 'INTC',
  ],
  NYSE: [
    'JPM', 'BAC', 'GS', 'WMT', 'XOM', 'CVX', 'PFE', 'KO', 'DIS', 'GE',
  ],
  EUROPE: [
    'SAP.DE', 'SIE.DE', 'BMW.DE', 'VOW3.DE', 'DTE.DE',
  ],
};

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────────────

function marketOf(symbol: string): Market {
  if (symbol.endsWith('.IS')) return 'BIST';
  if (symbol.endsWith('.DE') || symbol.endsWith('.PA') || symbol.endsWith('.L')) return 'EUROPE';
  if (MARKET_SYMBOLS.NYSE.includes(symbol)) return 'NYSE';
  return 'NASDAQ';
}

function mapPrice(q: any): StockPrice {
  return {
    current: q.regularMarketPrice ?? 0,
    open: q.regularMarketOpen ?? 0,
    high: q.regularMarketDayHigh ?? 0,
    low: q.regularMarketDayLow ?? 0,
    close: q.regularMarketPrice ?? 0,
    previousClose: q.regularMarketPreviousClose ?? 0,
    changeAmount: q.regularMarketChange ?? 0,
    changePercent: q.regularMarketChangePercent ?? 0,
    volume: q.regularMarketVolume ?? 0,
    avgVolume: q.averageDailyVolume3Month ?? 0,
    marketCap: q.marketCap ?? 0,
    timestamp: q.regularMarketTime ? q.regularMarketTime * 1000 : Date.now(),
  };
}

function mapStock(q: any): Stock {
  return {
    id: q.symbol,
    symbol: q.symbol,
    name: q.shortName || q.longName || q.symbol,
    market: marketOf(q.symbol),
    currency: q.currency || (q.symbol.endsWith('.IS') ? 'TRY' : 'USD'),
    sector: q.sector,
    price: mapPrice(q),
  };
}

async function fetchQuotes(symbols: string[]): Promise<Stock[]> {
  if (!symbols.length) return [];
  try {
    const url = `${YF_BASE}/v8/finance/quote?symbols=${symbols.join(',')}&lang=tr&region=TR`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) throw new Error('Yahoo Finance yanıt vermedi');
    const json = await res.json();
    const quotes: any[] = json?.quoteResponse?.result ?? [];
    return quotes.map(mapStock);
  } catch {
    // İlk sunucu başarısızsa ikincisini dene
    try {
      const url2 = `${YF_BASE2}/v8/finance/quote?symbols=${symbols.join(',')}&lang=tr&region=TR`;
      const res = await fetch(url2, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const json = await res.json();
      const quotes: any[] = json?.quoteResponse?.result ?? [];
      return quotes.map(mapStock);
    } catch {
      return [];
    }
  }
}

// ─── Public Service ───────────────────────────────────────────────────────────

export const stockService = {
  async getAllStocks(): Promise<Stock[]> {
    const key = CacheKeys.stockList('ALL');
    const cached = cache.get<Stock[]>(key);
    if (cached) return cached;
    const all = Object.values(MARKET_SYMBOLS).flat();
    const data = await fetchQuotes(all);
    cache.set(key, data, CacheTTL.history);
    return data;
  },

  async getStocksByMarket(market: Market): Promise<Stock[]> {
    const key = CacheKeys.stockList(market);
    const cached = cache.get<Stock[]>(key);
    if (cached) return cached;
    const symbols = MARKET_SYMBOLS[market] ?? [];
    const data = await fetchQuotes(symbols);
    cache.set(key, data, CacheTTL.prices);
    return data;
  },

  async searchStocks(query: string, market?: Market): Promise<Stock[]> {
    try {
      const url = `${YF_BASE}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=15&newsCount=0&lang=tr`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const json = await res.json();
      const hits: any[] = json?.finance?.result?.[0]?.quotes ?? json?.quotes ?? [];
      const symbols = hits
        .filter((h: any) => h.quoteType === 'EQUITY')
        .map((h: any) => h.symbol)
        .slice(0, 10);
      if (!symbols.length) return [];
      const stocks = await fetchQuotes(symbols);
      return market ? stocks.filter(s => s.market === market) : stocks;
    } catch {
      return [];
    }
  },

  async getStockById(id: string): Promise<Stock> {
    const cached = cache.get<Stock>(`stock:${id}`);
    if (cached) return cached;
    const [data] = await fetchQuotes([id]);
    if (!data) throw new Error(`Hisse bulunamadı: ${id}`);
    cache.set(`stock:${id}`, data, CacheTTL.prices);
    return data;
  },

  async getPrice(symbol: string): Promise<StockPrice> {
    const key = CacheKeys.stockPrice(symbol);
    const cached = cache.get<StockPrice>(key);
    if (cached) return cached;
    const [stock] = await fetchQuotes([symbol]);
    if (!stock?.price) throw new Error(`Fiyat bulunamadı: ${symbol}`);
    cache.set(key, stock.price, CacheTTL.prices);
    return stock.price;
  },

  async getBatchPrices(symbols: string[]): Promise<Record<string, StockPrice>> {
    const stocks = await fetchQuotes(symbols);
    const result: Record<string, StockPrice> = {};
    stocks.forEach(s => { if (s.price) result[s.symbol] = s.price; });
    return result;
  },

  async getHistory(
    symbol: string,
    period: '1D' | '1W' | '1M' | '1Y' | 'ALL',
    interval: '1m' | '5m' | '15m' | '1h' | '1d' = '1d',
  ): Promise<StockHistory[]> {
    const key = CacheKeys.stockHistory(symbol, `${period}_${interval}`);
    const cached = cache.get<StockHistory[]>(key);
    if (cached) return cached;

    const rangeMap: Record<string, string> = {
      '1D': '1d', '1W': '5d', '1M': '1mo', '1Y': '1y', 'ALL': '5y',
    };
    const intervalMap: Record<string, string> = {
      '1D': '5m', '1W': '15m', '1M': '1d', '1Y': '1d', 'ALL': '1wk',
    };

    const range = rangeMap[period] ?? '1mo';
    const yfInterval = intervalMap[period] ?? '1d';

    try {
      const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${yfInterval}&range=${range}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const json = await res.json();
      const chart = json?.chart?.result?.[0];
      if (!chart) return [];

      const timestamps: number[] = chart.timestamp ?? [];
      const ohlcv = chart.indicators?.quote?.[0] ?? {};

      const history: StockHistory[] = timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString(),
        open: ohlcv.open?.[i] ?? 0,
        high: ohlcv.high?.[i] ?? 0,
        low: ohlcv.low?.[i] ?? 0,
        close: ohlcv.close?.[i] ?? 0,
        volume: ohlcv.volume?.[i] ?? 0,
      })).filter(h => h.close > 0);

      cache.set(key, history, CacheTTL.history);
      return history;
    } catch {
      return [];
    }
  },

  async getTopGainers(market?: Market, limit = 10): Promise<Stock[]> {
    const symbols = market ? (MARKET_SYMBOLS[market] ?? []) : Object.values(MARKET_SYMBOLS).flat();
    const stocks = await fetchQuotes(symbols);
    return stocks.sort((a, b) => (b.price?.changePercent ?? 0) - (a.price?.changePercent ?? 0)).slice(0, limit);
  },

  async getTopLosers(market?: Market, limit = 10): Promise<Stock[]> {
    const symbols = market ? (MARKET_SYMBOLS[market] ?? []) : Object.values(MARKET_SYMBOLS).flat();
    const stocks = await fetchQuotes(symbols);
    return stocks.sort((a, b) => (a.price?.changePercent ?? 0) - (b.price?.changePercent ?? 0)).slice(0, limit);
  },

  async getMostActive(market?: Market, limit = 10): Promise<Stock[]> {
    const symbols = market ? (MARKET_SYMBOLS[market] ?? []) : Object.values(MARKET_SYMBOLS).flat();
    const stocks = await fetchQuotes(symbols);
    return stocks.sort((a, b) => (b.price?.volume ?? 0) - (a.price?.volume ?? 0)).slice(0, limit);
  },

  async getStocksBySector(sector: string, market?: Market): Promise<Stock[]> {
    const all = await this.getAllStocks();
    return all.filter(s =>
      s.sector?.toLowerCase() === sector.toLowerCase() &&
      (!market || s.market === market),
    );
  },

  async getAllSectors(market?: Market): Promise<string[]> {
    const all = await this.getAllStocks();
    const sectors = new Set<string>();
    all.filter(s => !market || s.market === market)
      .forEach(s => { if (s.sector) sectors.add(s.sector); });
    return Array.from(sectors).sort();
  },
};
