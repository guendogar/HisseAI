// ─── News Service – Direkt Yahoo Finance RSS/API ──────────────────────────────
// Backend'e gerek yok. React Native'de CORS olmadığı için direkt çekiyoruz.

import { NewsArticle } from '../../types';
import { cache, CacheKeys, CacheTTL } from '../cache';

const YF_BASE = 'https://query1.finance.yahoo.com';

// ─── Sentiment analizi ────────────────────────────────────────────────────────

const POSITIVE_WORDS = [
  'yükseldi', 'arttı', 'kazandı', 'rekor', 'büyüme', 'kâr', 'başarı', 'güçlü',
  'surge', 'rally', 'gain', 'profit', 'growth', 'record', 'beat', 'strong', 'bullish', 'jump', 'rise',
];
const NEGATIVE_WORDS = [
  'düştü', 'azaldı', 'kayıp', 'zarar', 'kriz', 'düşük', 'zayıf', 'risk', 'iflas',
  'drop', 'fall', 'loss', 'decline', 'weak', 'crash', 'bearish', 'cut', 'miss', 'plunge',
];

const CATEGORIES: Record<string, string[]> = {
  earnings: ['kazanç', 'kâr', 'zarar', 'gelir', 'earnings', 'revenue', 'profit', 'loss', 'eps'],
  merger: ['birleşme', 'satın alma', 'merger', 'acquisition', 'takeover', 'deal'],
  macro: ['faiz', 'enflasyon', 'fed', 'merkez bankası', 'interest rate', 'inflation', 'gdp'],
  analyst: ['hedef fiyat', 'tavsiye', 'derecelendirme', 'target price', 'upgrade', 'downgrade', 'analyst'],
  dividend: ['temettü', 'kâr payı', 'dividend', 'payout'],
  ipo: ['halka arz', 'ipo', 'listing'],
};

function analyzeSentiment(text: string): { sentiment: NewsArticle['sentiment']; score: number } {
  const lower = text.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) score += 1; });
  NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) score -= 1; });
  const normalized = Math.max(-1, Math.min(1, score / 3));
  const sentiment = normalized > 0.15 ? 'positive' : normalized < -0.15 ? 'negative' : 'neutral';
  return { sentiment, score: normalized };
}

function categorizeNews(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => text.includes(k))) return category;
  }
  return 'general';
}

function dedup(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter(a => {
    const key = a.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Yahoo Finance'ten haber çek ─────────────────────────────────────────────

async function fetchYahooNews(query: string, newsCount = 20): Promise<NewsArticle[]> {
  try {
    const url = `${YF_BASE}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=0&newsCount=${newsCount}&lang=en-US`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return [];
    const json = await res.json();
    const newsItems: any[] = json?.news ?? [];

    return newsItems.map((n: any, i: number) => {
      const title = n.title || '';
      const content = n.summary || title;
      const text = title + ' ' + content;
      const { sentiment, score } = analyzeSentiment(text);
      const category = categorizeNews(title, content);

      return {
        id: n.uuid || `news-yf-${i}`,
        title,
        content,
        summary: n.summary,
        source: n.publisher || 'Yahoo Finance',
        sourceUrl: n.link || '',
        publishedAt: n.providerPublishTime
          ? new Date(n.providerPublishTime * 1000).toISOString()
          : new Date().toISOString(),
        relatedSymbols: n.relatedTickers || [],
        sentiment,
        sentimentScore: score,
        category,
        imageUrl: n.thumbnail?.resolutions?.[0]?.url,
      } as NewsArticle;
    });
  } catch {
    return [];
  }
}

// ─── Public Service ───────────────────────────────────────────────────────────

export const newsService = {
  async getNews(params?: {
    symbol?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<NewsArticle[]> {
    const symbol = params?.symbol;
    const pageSize = params?.pageSize ?? 20;
    const query = symbol || params?.category || 'stock market finance';

    const cacheKey = CacheKeys.news(symbol) + `:${params?.category ?? 'all'}`;
    const cached = cache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const raw = await fetchYahooNews(query, pageSize);

    // Kategori filtresi
    const filtered = params?.category
      ? raw.filter(a => a.category === params.category)
      : raw;

    const processed = dedup(filtered);
    cache.set(cacheKey, processed, CacheTTL.news);
    return processed;
  },

  async getNewsById(id: string): Promise<NewsArticle> {
    // Yahoo Finance tek haber detayı için ayrı endpoint yok,
    // cache'den dönelim ya da genel haberler içinde arayalım
    const cached = cache.get<NewsArticle>(`news:item:${id}`);
    if (cached) return cached;

    // Cache'den bulunamazsa genel haberlerden ara
    const all = await this.getNews({ pageSize: 50 });
    const found = all.find(a => a.id === id);
    if (found) return found;

    throw new Error(`Haber bulunamadı: ${id}`);
  },

  async getTopNewsBySymbol(symbol: string, limit = 5): Promise<NewsArticle[]> {
    const all = await this.getNews({ symbol });
    return all.slice(0, limit);
  },

  analyzeArticles(articles: NewsArticle[]): {
    positive: number;
    negative: number;
    neutral: number;
    avgScore: number;
  } {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    let total = 0;
    articles.forEach(a => {
      counts[a.sentiment]++;
      total += a.sentimentScore;
    });
    return { ...counts, avgScore: articles.length ? total / articles.length : 0 };
  },
};
