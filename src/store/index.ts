import { configureStore } from '@reduxjs/toolkit';
import stocksReducer from './slices/stocksSlice';
import watchlistReducer from './slices/watchlistSlice';
import aiReducer from './slices/aiSlice';
import notificationsReducer from './slices/notificationsSlice';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    stocks: stocksReducer,
    watchlist: watchlistReducer,
    ai: aiReducer,
    notifications: notificationsReducer,
    auth: authReducer,
    settings: settingsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['stocks/priceUpdate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
