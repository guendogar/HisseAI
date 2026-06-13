import { NewsArticle } from '../../types';
import { cache, CacheKeys, CacheTTL } from '../cache';
import { MOCK_NEWS } from './mockData';

const USE_MOCK = false; // Backend hazır olunca false yapın

// ─── Sentiment ───────────────────────────────────────────────────────────────

const POSITIVE_WORDS = [
  'yükseldi', 'arttı', 'kazandı', 'rekor', 'büyüme', 'kâr', 'başarı', 'güçlü',
  'surge', 'rally', 'gain', 'profit', 'growth', 'record', 'beat', 'strong', 'bullish',
];
const NEGATIVE_WORDS = [
  'düştü', 'azaldı', 'kayıp', 'zarar', 'kriz', 'düşük', 'zayıf', 'risk', 'iflas',
  'drop', 'fall', 'loss', 'decline', 'weak', 'crash', 'bearish', 'cut', 'miss',
];

const CATEGORIES: Record<string, string[]> = {
  earnings: ['kazanç', 'kâr', 'zarar', 'gelir', 'earnings', 'revenue', 'profit', 'loss', 'eps'],
  merger: ['birleşme', 'satın alma', 'merger', 'acquisition', 'takeover', 'deal'],
  macro: ['faiz', 'enflasyon', 'fed', 'merkez bankası', 'interest rate', 'inflation', 'fed', 'gdp'],
  analyst: ['hedef fiyat', 'tavsiye', 'derecelendirme', 'target price', 'upgrade', 'downgrade', 'analyst'],
  dividend: ['temettü', 'kâr payı', 'dividend', 'payout'],
  ipo: ['halka arz', 'ipo', 'listing'],
};

const SPAM_PATTERNS = [
  /\b(reklam|sponsor|advertisement|promoted)\b/i,
  /\b(ücretsiz|free money|get rich)\b/i,
  /click here|tıklayın/i,
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function analyzeSentiment(text: string): { sentiment: NewsArticle['sentiment']; score: number } {
  const lower = text.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) score += 1; });
  NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) score -= 1; });
  const normalized = Math.max(-1, Math.min(1, score / 3));
  const sentiment =
    normalized > 0.15 ? 'positive' : normalized < -0.15 ? 'negative' : 'neutral';
  return { sentiment, score: normalized };
}

function categorizeNews(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => text.includes(k))) return category;
  }
  return 'general';
}

function isSpam(article: { title: string; content: string }): boolean {
  const text = article.title + ' ' + article.content;
  return SPAM_PATTERNS.some(p => p.test(text));
}

function deduplicateNews(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter(a => {
    // Normalize title for dedup: lowercase + first 60 chars
    const key = a.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function enrichArticle(raw: NewsArticle): NewsArticle {
  const text = raw.title + ' ' + (raw.content ?? '');
  const { sentiment, score } = analyzeSentiment(text);
  const category = raw.category || categorizeNews(raw.title, raw.content);
  return { ...raw, sentiment, sentimentScore: score, category };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const newsService = {
  async getNews(params?: {
    symbol?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<NewsArticle[]> {
    const symbol = params?.symbol;
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;

    const cacheKey = CacheKeys.news(symbol) + `:${params?.category ?? 'all'}:p${page}`;
    const cached = cache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    let raw: NewsArticle[];
    if (USE_MOCK) {
      await new Promise(r => setTimeout(() => r(undefined), 250));
      raw = MOCK_NEWS
        .filter(a => !symbol || (a.relatedSymbols ?? []).includes(symbol))
        .filter(a => !params?.category || a.category === params.category)
        .slice((page - 1) * pageSize, page * pageSize);
      // Fallback: if filtering by symbol yields nothing, return all news
      if (raw.length === 0 && symbol) raw = MOCK_NEWS.slice(0, pageSize);
    } else {
      const { apiClient } = await import('./client');
      const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (symbol) query.set('symbol', symbol);
      if (params?.category) query.set('category', params.category);
      raw = await apiClient.get<NewsArticle[]>(`/news?${query.toString()}`);
    }

    // Process pipeline: spam filter → deduplicate → enrich
    const processed = deduplicateNews(
      raw.filter(a => !isSpam(a)).map(enrichArticle),
    );

    cache.set(cacheKey, processed, CacheTTL.news);
    return processed;
  },

  async getNewsById(id: string): Promise<NewsArticle> {
    const cached = cache.get<NewsArticle>(`news:item:${id}`);
    if (cached) return cached;
    let raw: NewsArticle;
    if (USE_MOCK) {
      await new Promise(r => setTimeout(() => r(undefined), 150));
      const found = MOCK_NEWS.find(a => a.id === id);
      if (!found) throw new Error(`Haber bulunamadı: ${id}`);
      raw = found;
    } else {
      const { apiClient } = await import('./client');
      raw = await apiClient.get<NewsArticle>(`/news/${id}`);
    }
    const enriched = enrichArticle(raw);
    cache.set(`news:item:${id}`, enriched, CacheTTL.news);
    return enriched;
  },

  async getTopNewsBySymbol(symbol: string, limit = 5): Promise<NewsArticle[]> {
    const all = await this.getNews({ symbol });
    return all.slice(0, limit);
  },

  // Local-only: analyze a batch of raw articles (used by AI layer)
  analyzeArticles(articles: NewsArticle[]): {
    positive: number;
    negative: number;
    neutral: number;
    avgScore: number;
  } {
    const enriched = articles.map(enrichArticle);
    const counts = { positive: 0, negative: 0, neutral: 0 };
    let total = 0;
    enriched.forEach(a => {
      counts[a.sentiment]++;
      total += a.sentimentScore;
    });
    return { ...counts, avgScore: enriched.length ? total / enriched.length : 0 };
  },
};
