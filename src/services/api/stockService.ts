// ─── Stock Service – newsService ile aynı yaklaşım ────────────────────────────
// v1/finance/search ve v8/finance/chart endpointleri CORS'a takılmıyor.
// newsService'in çalıştığı gibi bu da backend olmadan gerçek veri çeker.

import { Stock, StockPrice, StockHistory } from '../../types';
import { Market } from '../../constants';
import { cache, CacheKeys, CacheTTL } from '../cache';
import { MOCK_STOCKS, generateMockHistory } from './mockData';

const YF = 'https://query1.finance.yahoo.com';
const YF2 = 'https://query2.finance.yahoo.com';

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

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

function marketOf(symbol: string): Market {
  if (symbol.endsWith('.IS')) return 'BIST';
  if (symbol.endsWith('.DE') || symbol.endsWith('.PA') || symbol.endsWith('.L')) return 'EUROPE';
  if (MARKET_SYMBOLS.NYSE.includes(symbol)) return 'NYSE';
  return 'NASDAQ';
}

// chart API meta objesinden Stock oluştur
function stockFromChart(symbol: string, meta: any): Stock {
  const price: StockPrice = {
    current:        meta.regularMarketPrice         ?? meta.chartPreviousClose ?? 0,
    open:           meta.regularMarketOpen          ?? meta.chartPreviousClose ?? 0,
    high:           meta.regularMarketDayHigh       ?? 0,
    low:            meta.regularMarketDayLow        ?? 0,
    close:          meta.regularMarketPrice         ?? 0,
    previousClose:  meta.chartPreviousClose         ?? meta.previousClose ?? 0,
    changeAmount:   meta.regularMarketPrice != null && meta.chartPreviousClose != null
                      ? meta.regularMarketPrice - meta.chartPreviousClose : 0,
    changePercent:  meta.regularMarketPrice != null && meta.chartPreviousClose != null && meta.chartPreviousClose !== 0
                      ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100 : 0,
    volume:         meta.regularMarketVolume        ?? 0,
    avgVolume:      meta.averageDailyVolume3Month   ?? 0,
    marketCap:      0,
    timestamp:      meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now(),
  };
  return {
    id:       symbol,
    symbol,
    name:     meta.longName || meta.shortName || symbol,
    market:   marketOf(symbol),
    currency: meta.currency || (symbol.endsWith('.IS') ? 'TRY' : 'USD'),
    sector:   meta.sector,
    price,
    isLive:   true,
  };
}

// Mock fallback
function mockFallback(symbols: string[]): Stock[] {
  const upper = symbols.map(s =>
    s.replace('.IS','').replace('.DE','').replace('.PA','').replace('.L','').toUpperCase()
  );
  return MOCK_STOCKS.filter(s => upper.includes(s.symbol.toUpperCase()));
}

// ─── Tek sembol için chart API (newsService gibi direkt fetch) ────────────────
// /v8/finance/chart/ CORS'a takılmıyor — newsService'in kullandığı host üzerinden çalışıyor

async function fetchChartQuote(symbol: string): Promise<Stock | null> {
  const urls = [
    `${YF}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d&includePrePost=false`,
    `${YF2}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d&includePrePost=false`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      });
      if (!res.ok) continue;
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      if (!meta || !meta.regularMarketPrice) continue;
      return stockFromChart(symbol, meta);
    } catch {
      // diğerini dene
    }
  }
  return null;
}

// ─── Çoklu sembol – newsService gibi paralel çekiş ───────────────────────────

async function fetchQuotes(symbols: string[]): Promise<Stock[]> {
  if (!symbols.length) return [];

  // Paralel olarak hepsini çek (newsService yaklaşımı)
  const results = await Promise.allSettled(symbols.map(s => fetchChartQuote(s)));

  const stocks: Stock[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      stocks.push(r.value);
    }
  });

  if (stocks.length > 0) return stocks;

  // Hiç gelmezse mock
  console.warn('[StockService] Chart API ulaşılamıyor, mock verisi kullanılıyor.');
  return mockFallback(symbols);
}

// ─── Public Service ───────────────────────────────────────────────────────────

export const stockService = {
  async getAllStocks(): Promise<Stock[]> {
    const key = CacheKeys.stockList('ALL');
    const cached = cache.get<Stock[]>(key);
    if (cached) return cached;
    const all = Object.values(MARKET_SYMBOLS).flat();
    const data = await fetchQuotes(all);
    const result = data.length > 0 ? data : MOCK_STOCKS;
    cache.set(key, result, CacheTTL.history);
    return result;
  },

  async getStocksByMarket(market: Market): Promise<Stock[]> {
    const key = CacheKeys.stockList(market);
    const cached = cache.get<Stock[]>(key);
    if (cached) return cached;
    const symbols = MARKET_SYMBOLS[market] ?? [];
    const data = await fetchQuotes(symbols);
    const result = data.length > 0 ? data : mockFallback(symbols);
    cache.set(key, result, CacheTTL.prices);
    return result;
  },

  async searchStocks(query: string, market?: Market): Promise<Stock[]> {
    try {
      const url = `${YF}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=15&newsCount=0&lang=en-US`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } });
      const json = await res.json();
      const hits: any[] = json?.quotes ?? json?.finance?.result?.[0]?.quotes ?? [];
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
    const data = await fetchChartQuote(id);
    if (!data) throw new Error(`Hisse bulunamadı: ${id}`);
    cache.set(`stock:${id}`, data, CacheTTL.prices);
    return data;
  },

  async getPrice(symbol: string): Promise<StockPrice> {
    const key = CacheKeys.stockPrice(symbol);
    const cached = cache.get<StockPrice>(key);
    if (cached) return cached;
    const stock = await fetchChartQuote(symbol);
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
    const daysMap: Record<string, number> = {
      '1D': 1, '1W': 7, '1M': 30, '1Y': 365, 'ALL': 1825,
    };

    const range = rangeMap[period] ?? '1mo';
    const yfInterval = intervalMap[period] ?? '1d';

    const urls = [
      `${YF}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${yfInterval}&range=${range}`,
      `${YF2}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${yfInterval}&range=${range}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } });
        if (!res.ok) continue;
        const json = await res.json();
        const chart = json?.chart?.result?.[0];
        if (!chart) continue;

        const timestamps: number[] = chart.timestamp ?? [];
        const ohlcv = chart.indicators?.quote?.[0] ?? {};

        const history: StockHistory[] = timestamps.map((ts: number, i: number) => ({
          date:   new Date(ts * 1000).toISOString(),
          open:   ohlcv.open?.[i]   ?? 0,
          high:   ohlcv.high?.[i]   ?? 0,
          low:    ohlcv.low?.[i]    ?? 0,
          close:  ohlcv.close?.[i]  ?? 0,
          volume: ohlcv.volume?.[i] ?? 0,
        })).filter(h => h.close > 0);

        if (history.length > 0) {
          cache.set(key, history, CacheTTL.history);
          return history;
        }
      } catch {
        // diğer URL'yi dene
      }
    }

    // Gerçek veri gelmedi → mock geçmiş üret
    const mockStock = MOCK_STOCKS.find(s => s.symbol === symbol || s.symbol === symbol.replace('.IS', ''));
    const basePrice = mockStock?.price?.current ?? 100;
    const mockHistory = generateMockHistory(basePrice, daysMap[period] ?? 30);
    cache.set(key, mockHistory, CacheTTL.history);
    return mockHistory;
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
