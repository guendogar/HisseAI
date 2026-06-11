import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Stock, StockPrice } from '../../types';
import { Market } from '../../constants';

interface StocksState {
  items: Record<string, Stock>;
  lists: Record<string, string[]>;
  loading: boolean;
  error: string | null;
  lastUpdated: Record<string, number>;
}

const initialState: StocksState = {
  items: {},
  lists: {},
  loading: false,
  error: null,
  lastUpdated: {},
};

const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    setStocks(state, action: PayloadAction<{ market: Market; stocks: Stock[] }>) {
      const { market, stocks } = action.payload;
      state.lists[market] = stocks.map(s => s.id);
      stocks.forEach(s => { state.items[s.id] = s; });
      state.lastUpdated[market] = Date.now();
    },
    priceUpdate(state, action: PayloadAction<{ id: string; price: StockPrice }>) {
      const { id, price } = action.payload;
      if (state.items[id]) {
        state.items[id].price = price;
      }
    },
    setFavorite(state, action: PayloadAction<{ id: string; isFavorite: boolean }>) {
      const { id, isFavorite } = action.payload;
      if (state.items[id]) state.items[id].isFavorite = isFavorite;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setStocks, priceUpdate, setFavorite, setLoading, setError } = stocksSlice.actions;
export default stocksSlice.reducer;
