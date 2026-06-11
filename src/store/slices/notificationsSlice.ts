import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppNotification, NotificationPrefs, PriceAlert } from '../../types';

interface NotificationsState {
  notifications: AppNotification[];
  alerts: PriceAlert[];
  prefs: NotificationPrefs;
  unreadCount: number;
}

const defaultPrefs: NotificationPrefs = {
  priceAlerts: true,
  aiPredictions: true,
  news: false,
  watchlist: true,
  silentMode: false,
};

const initialState: NotificationsState = {
  notifications: [],
  alerts: [],
  prefs: defaultPrefs,
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    addNotification(state, action: PayloadAction<AppNotification>) {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount += 1;
    },
    markRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find(n => n.id === action.payload);
      if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
    },
    markAllRead(state) {
      state.notifications.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },
    setAlerts(state, action: PayloadAction<PriceAlert[]>) {
      state.alerts = action.payload;
    },
    addAlert(state, action: PayloadAction<PriceAlert>) {
      state.alerts.push(action.payload);
    },
    removeAlert(state, action: PayloadAction<string>) {
      state.alerts = state.alerts.filter(a => a.id !== action.payload);
    },
    updatePrefs(state, action: PayloadAction<Partial<NotificationPrefs>>) {
      state.prefs = { ...state.prefs, ...action.payload };
    },
  },
});

export const {
  setNotifications, addNotification, markRead, markAllRead,
  setAlerts, addAlert, removeAlert, updatePrefs,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
