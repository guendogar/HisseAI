// ─── Sync Service (Mock Mode) ─────────────────────────────────────────────────
// Backend hazır olmadığı için push/pull işlemleri sessizce atlanır.
// Backend hazır olduğunda USE_MOCK = false yapın.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

const USE_MOCK = false; // Backend hazır olunca false yapın

export const syncService = {
  async pushData(): Promise<void> {
    if (USE_MOCK) {
      // Backend olmadan sessizce başarılı dön
      return;
    }
    try {
      const { apiClient } = await import('./client');
      const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      const watchlists = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLISTS);
      const aiReports = await AsyncStorage.getItem(STORAGE_KEYS.AI_REPORTS);
      const prefs = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS);

      const payload = {
        favorites: favorites ? JSON.parse(favorites) : [],
        watchlists: watchlists ? JSON.parse(watchlists) : [],
        aiReports: aiReports ? JSON.parse(aiReports) : [],
        notificationPrefs: prefs ? JSON.parse(prefs) : {},
      };

      await apiClient.post('/sync/push', payload);
    } catch {
      // Sync hatası uygulamayı durdurmamalı
    }
  },

  async pullData(): Promise<any> {
    if (USE_MOCK) {
      // Backend olmadan yerel veriyi döndür
      const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      const watchlists = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLISTS);
      return {
        favorites: favorites ? JSON.parse(favorites) : [],
        watchlists: watchlists ? JSON.parse(watchlists) : [],
      };
    }
    try {
      const { apiClient } = await import('./client');
      const data = await apiClient.get<any>('/sync/pull');
      if (data.favorites) await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
      if (data.watchlists) await AsyncStorage.setItem(STORAGE_KEYS.WATCHLISTS, JSON.stringify(data.watchlists));
      if (data.aiReports) await AsyncStorage.setItem(STORAGE_KEYS.AI_REPORTS, JSON.stringify(data.aiReports));
      if (data.notificationPrefs) await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(data.notificationPrefs));
      return data;
    } catch {
      return {};
    }
  },
};
