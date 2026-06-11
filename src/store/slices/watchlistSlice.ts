import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WatchList } from '../../types';

interface WatchlistState {
  lists: WatchList[];
  favorites: string[];
  loading: boolean;
  error: string | null;
}

const initialState: WatchlistState = {
  lists: [],
  favorites: [],
  loading: false,
  error: null,
};

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    setWatchlists(state, action: PayloadAction<WatchList[]>) {
      state.lists = action.payload;
    },
    addWatchlist(state, action: PayloadAction<WatchList>) {
      state.lists.push(action.payload);
    },
    removeWatchlist(state, action: PayloadAction<string>) {
      state.lists = state.lists.filter(l => l.id !== action.payload);
    },
    updateWatchlist(state, action: PayloadAction<WatchList>) {
      const idx = state.lists.findIndex(l => l.id === action.payload.id);
      if (idx !== -1) state.lists[idx] = action.payload;
    },
    setFavorites(state, action: PayloadAction<string[]>) {
      state.favorites = action.payload;
    },
    addFavorite(state, action: PayloadAction<string>) {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.favorites = state.favorites.filter(s => s !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setWatchlists, addWatchlist, removeWatchlist, updateWatchlist,
  setFavorites, addFavorite, removeFavorite, setLoading, setError,
} = watchlistSlice.actions;
export default watchlistSlice.reducer;
