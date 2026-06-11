// ─── Stock Utilities ──────────────────────────────────────────────────────────
// Helper functions for stock operations

import { Stock, StockPrice } from '../types';
import { Market, MARKETS } from '../constants';

// ─── Market & Sector Metadata ─────────────────────────────────────────────────

export const SECTOR_METADATA = {
  // Turkish sectors (BIST)
  'Bankacılık': { label: 'Bankacılık', color: '#1f77b4', icon: '🏦' },
  'Enerji': { label: 'Enerji', color: '#ff7f0e', icon: '⚡' },
  'Sanayi': { label: 'Sanayi', color: '#2ca02c', icon: '🏭' },
  'Teknoloji': { label: 'Teknoloji', color: '#d62728', icon: '💻' },
  'Perakende': { label: 'Perakende', color: '#9467bd', icon: '🛍️' },
  'Holding': { label: 'Holding', color: '#8c564b', icon: '🏢' },
  'Kimya': { label: 'Kimya', color: '#e377c2', icon: '⚗️' },
  'Havacılık': { label: 'Havacılık', color: '#7f7f7f', icon: '✈️' },
  'İletişim': { label: 'İletişim', color: '#bcbd22', icon: '📡' },
  'Otomotiv': { label: 'Otomotiv', color: '#17becf', icon: '🚗' },
  'İnşaat': { label: 'İnşaat', color: '#ff9896', icon: '🏗️' },
  'Savunma': { label: 'Savunma', color: '#c5b0d5', icon: '🛡️' },
  'Finans': { label: 'Finans', color: '#c49c94', icon: '💰' },
  'Elektronik': { label: 'Elektronik', color: '#f7b6d2', icon: '📱' },
  'Beyaz Eşya': { label: 'Beyaz Eşya', color: '#c7c7c7', icon: '❄️' },

  // International sectors
  'Technology': { label: 'Technology', color: '#1f77b4', icon: '💻' },
  'Financials': { label: 'Financials', color: '#ff7f0e', icon: '💼' },
  'Consumer Staples': { label: 'Consumer Staples', color: '#2ca02c', icon: '🛒' },
  'Consumer Discretionary': { label: 'Consumer Discretionary', color: '#d62728', icon: '🎯' },
  'Healthcare': { label: 'Healthcare', color: '#9467bd', icon: '⚕️' },
  'Energy': { label: 'Energy', color: '#8c564b', icon: '🔋' },
  'Industrials': { label: 'Industrials', color: '#e377c2', icon: '🏭' },
  'Aerospace': { label: 'Aerospace', color: '#7f7f7f', icon: '🚀' },
  'Media': { label: 'Media', color: '#bcbd22', icon: '📺' },
  'Automotive': { label: 'Automotive', color: '#17becf', icon: '🚗' },
} as const;

export type SectorKey = keyof typeof SECTOR_METADATA;

// ─── Stock Comparison & Filtering ─────────────────────────────────────────────

export function getSectorLabel(sector?: string): string {
  if (!sector) return 'Other';
  return (SECTOR_METADATA as any)[sector]?.label ?? sector;
}

export function getSectorColor(sector?: string): string {
  if (!sector) return '#cccccc';
  return (SECTOR_METADATA as any)[sector]?.color ?? '#cccccc';
}

export function getSectorIcon(sector?: string): string {
  if (!sector) return '📊';
  return (SECTOR_METADATA as any)[sector]?.icon ?? '📊';
}

export function groupStocksBySector(stocks: Stock[]): Record<string, Stock[]> {
  const grouped: Record<string, Stock[]> = {};
  stocks.forEach(stock => {
    const sector = stock.sector || 'Other';
    if (!grouped[sector]) {
      grouped[sector] = [];
    }
    grouped[sector].push(stock);
  });
  return grouped;
}

export function groupStocksByMarket(stocks: Stock[]): Record<Market, Stock[]> {
  const grouped: Record<Market, Stock[]> = {
    BIST: [],
    NASDAQ: [],
    NYSE: [],
    EUROPE: [],
  };
  stocks.forEach(stock => {
    if (stock.market in grouped) {
      grouped[stock.market as Market].push(stock);
    }
  });
  return grouped;
}

// ─── Stock Performance ─────────────────────────────────────────────────────────

export function sortByPerformance(
  stocks: Stock[],
  order: 'gainers' | 'losers' | 'volume' = 'gainers',
  limit?: number,
): Stock[] {
  let sorted = [...stocks];

  if (order === 'gainers') {
    sorted.sort((a, b) => (b.price?.changePercent ?? 0) - (a.price?.changePercent ?? 0));
  } else if (order === 'losers') {
    sorted.sort((a, b) => (a.price?.changePercent ?? 0) - (b.price?.changePercent ?? 0));
  } else if (order === 'volume') {
    sorted.sort((a, b) => (b.price?.volume ?? 0) - (a.price?.volume ?? 0));
  }

  return limit ? sorted.slice(0, limit) : sorted;
}

export function calculateMarketStats(stocks: Stock[]) {
  const total = stocks.length;
  const gainers = stocks.filter(s => (s.price?.changePercent ?? 0) > 0).length;
  const losers = stocks.filter(s => (s.price?.changePercent ?? 0) < 0).length;
  const unchanged = total - gainers - losers;

  const avgChange = stocks.reduce((sum, s) => sum + (s.price?.changePercent ?? 0), 0) / total;
  const totalVolume = stocks.reduce((sum, s) => sum + (s.price?.volume ?? 0), 0);

  return {
    total,
    gainers,
    losers,
    unchanged,
    avgChange,
    totalVolume,
    gainersPercent: (gainers / total) * 100,
    losersPercent: (losers / total) * 100,
  };
}

// ─── Stock Search & Filter ────────────────────────────────────────────────────

export function filterStocks(
  stocks: Stock[],
  filters: {
    market?: Market;
    sector?: string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
  },
): Stock[] {
  return stocks.filter(stock => {
    if (filters.market && stock.market !== filters.market) return false;
    if (filters.sector && stock.sector !== filters.sector) return false;
    if (filters.minPrice && (stock.price?.current ?? 0) < filters.minPrice) return false;
    if (filters.maxPrice && (stock.price?.current ?? 0) > filters.maxPrice) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matches =
        stock.symbol.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.description?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
}

// ─── Market Statistics ────────────────────────────────────────────────────────

export function getMarketStats(stocks: Stock[], market: Market) {
  const marketStocks = stocks.filter(s => s.market === market);
  return calculateMarketStats(marketStocks);
}

export function getAllMarketStats(stocks: Stock[]) {
  return {
    BIST: getMarketStats(stocks, 'BIST'),
    NASDAQ: getMarketStats(stocks, 'NASDAQ'),
    NYSE: getMarketStats(stocks, 'NYSE'),
    EUROPE: getMarketStats(stocks, 'EUROPE'),
  };
}
