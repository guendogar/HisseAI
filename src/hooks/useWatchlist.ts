import { useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from './useStore';
import {
  setFavorites,
  addFavorite,
  removeFavorite,
  setWatchlists,
  addWatchlist,
  removeWatchlist,
  updateWatchlist,
} from '../store/slices/watchlistSlice';
import { WatchList } from '../types';
import { STORAGE_KEYS } from '../constants';
import { generateId } from '../utils';

// ─── Persistence helpers ─────────────────────────────────────────────────────

const saveFavorites = async (favorites: string[]) => {
  await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
};

const saveWatchlists = async (lists: WatchList[]) => {
  await AsyncStorage.setItem(STORAGE_KEYS.WATCHLISTS, JSON.stringify(lists));
};

// ─── useFavorites ─────────────────────────────────────────────────────────────

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(s => s.watchlist.favorites);

  // Hydrate on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.FAVORITES).then(raw => {
      if (raw) {
        try {
          dispatch(setFavorites(JSON.parse(raw)));
        } catch {}
      }
    });
  }, []);

  const toggleFavorite = useCallback(
    async (symbol: string) => {
      let updated: string[];
      if (favorites.includes(symbol)) {
        dispatch(removeFavorite(symbol));
        updated = favorites.filter(s => s !== symbol);
      } else {
        dispatch(addFavorite(symbol));
        updated = [...favorites, symbol];
      }
      await saveFavorites(updated);
    },
    [favorites, dispatch],
  );

  const isFavorite = useCallback(
    (symbol: string) => favorites.includes(symbol),
    [favorites],
  );

  return { favorites, toggleFavorite, isFavorite };
};

// ─── useWatchlists ────────────────────────────────────────────────────────────

export const useWatchlists = () => {
  const dispatch = useAppDispatch();
  const lists = useAppSelector(s => s.watchlist.lists);

  // Hydrate on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.WATCHLISTS).then(raw => {
      if (raw) {
        try {
          dispatch(setWatchlists(JSON.parse(raw)));
        } catch {}
      }
    });
  }, []);

  const createList = useCallback(
    async (name: string) => {
      const newList: WatchList = {
        id: generateId(),
        name,
        symbols: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(addWatchlist(newList));
      await saveWatchlists([...lists, newList]);
      return newList;
    },
    [lists, dispatch],
  );

  const deleteList = useCallback(
    async (id: string) => {
      dispatch(removeWatchlist(id));
      const updated = lists.filter(l => l.id !== id);
      await saveWatchlists(updated);
    },
    [lists, dispatch],
  );

  const renameList = useCallback(
    async (id: string, name: string) => {
      const list = lists.find(l => l.id === id);
      if (!list) return;
      const updated: WatchList = { ...list, name, updatedAt: new Date().toISOString() };
      dispatch(updateWatchlist(updated));
      await saveWatchlists(lists.map(l => (l.id === id ? updated : l)));
    },
    [lists, dispatch],
  );

  const addSymbolToList = useCallback(
    async (id: string, symbol: string) => {
      const list = lists.find(l => l.id === id);
      if (!list || list.symbols.includes(symbol)) return;
      const updated: WatchList = {
        ...list,
        symbols: [...list.symbols, symbol],
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateWatchlist(updated));
      await saveWatchlists(lists.map(l => (l.id === id ? updated : l)));
    },
    [lists, dispatch],
  );

  const removeSymbolFromList = useCallback(
    async (id: string, symbol: string) => {
      const list = lists.find(l => l.id === id);
      if (!list) return;
      const updated: WatchList = {
        ...list,
        symbols: list.symbols.filter(s => s !== symbol),
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateWatchlist(updated));
      await saveWatchlists(lists.map(l => (l.id === id ? updated : l)));
    },
    [lists, dispatch],
  );

  const reorderSymbols = useCallback(
    async (id: string, symbols: string[]) => {
      const list = lists.find(l => l.id === id);
      if (!list) return;
      const updated: WatchList = { ...list, symbols, updatedAt: new Date().toISOString() };
      dispatch(updateWatchlist(updated));
      await saveWatchlists(lists.map(l => (l.id === id ? updated : l)));
    },
    [lists, dispatch],
  );

  return {
    lists,
    createList,
    deleteList,
    renameList,
    addSymbolToList,
    removeSymbolFromList,
    reorderSymbols,
  };
};
