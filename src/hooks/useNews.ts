import { useState, useCallback, useEffect, useRef } from 'react';
import { newsService } from '../services/api/newsService';
import { NewsArticle } from '../types';

interface UseNewsOptions {
  symbol?: string;
  category?: string;
  autoLoad?: boolean;
}

export const useNews = (options: UseNewsOptions = {}) => {
  const { symbol, category, autoLoad = true } = options;
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const fetchPage = useCallback(
    async (p: number, reset = false) => {
      try {
        const data = await newsService.getNews({ symbol, category, page: p, pageSize: 20 });
        setArticles(prev => (reset ? data : [...prev, ...data]));
        setHasMore(data.length === 20);
        pageRef.current = p;
      } catch (e: any) {
        setError(e?.message ?? 'Haberler yüklenemedi.');
      }
    },
    [symbol, category],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    await fetchPage(1, true);
    setPage(1);
    setLoading(false);
  }, [fetchPage]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPage(1, true);
    setPage(1);
    setRefreshing(false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const next = pageRef.current + 1;
    setPage(next);
    await fetchPage(next, false);
  }, [hasMore, loading, fetchPage]);

  useEffect(() => {
    if (autoLoad) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, category]);

  const sentimentStats = useCallback(
    () => newsService.analyzeArticles(articles),
    [articles],
  );

  return { articles, loading, refreshing, error, hasMore, load, refresh, loadMore, sentimentStats };
};
