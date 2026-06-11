import { useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from './useStore';
import {
  setNotifications,
  addNotification,
  markRead,
  markAllRead,
  setAlerts,
  addAlert,
  removeAlert,
  updatePrefs,
} from '../store/slices/notificationsSlice';
import { AppNotification, NotificationPrefs, PriceAlert } from '../types';
import { generateId } from '../utils';

const NOTIF_KEY = '@hisse_notifications';
const ALERTS_KEY = '@hisse_price_alerts';
const PREFS_KEY = '@hisse_notif_prefs';

async function load<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
async function save(key: string, data: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(s => s.notifications.notifications);
  const alerts = useAppSelector(s => s.notifications.alerts);
  const prefs = useAppSelector(s => s.notifications.prefs);
  const unreadCount = useAppSelector(s => s.notifications.unreadCount);

  // Hydrate on mount
  useEffect(() => {
    Promise.all([load<AppNotification[]>(NOTIF_KEY), load<PriceAlert[]>(ALERTS_KEY), load<NotificationPrefs>(PREFS_KEY)]).then(
      ([notifs, alertsData, prefsData]) => {
        if (notifs) dispatch(setNotifications(notifs));
        if (alertsData) dispatch(setAlerts(alertsData));
        if (prefsData) dispatch(updatePrefs(prefsData));
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushNotification = useCallback(
    async (type: AppNotification['type'], title: string, body: string, data?: Record<string, unknown>) => {
      const notif: AppNotification = {
        id: generateId(),
        type,
        title,
        body,
        data,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      dispatch(addNotification(notif));
      const existing = (await load<AppNotification[]>(NOTIF_KEY)) ?? [];
      await save(NOTIF_KEY, [notif, ...existing].slice(0, 100));
    },
    [dispatch],
  );

  const readNotification = useCallback(
    async (id: string) => {
      dispatch(markRead(id));
      const updated = notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
      await save(NOTIF_KEY, updated);
    },
    [dispatch, notifications],
  );

  const readAll = useCallback(async () => {
    dispatch(markAllRead());
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    await save(NOTIF_KEY, updated);
  }, [dispatch, notifications]);

  const clearNotifications = useCallback(async () => {
    dispatch(setNotifications([]));
    await AsyncStorage.removeItem(NOTIF_KEY);
  }, [dispatch]);

  // ─── Price Alerts ─────────────────────────────────────────────────────────

  const createAlert = useCallback(
    async (symbol: string, targetPrice: number, direction: PriceAlert['direction']) => {
      const alert: PriceAlert = {
        id: generateId(),
        symbol,
        targetPrice,
        direction,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      dispatch(addAlert(alert));
      await save(ALERTS_KEY, [...alerts, alert]);
      return alert;
    },
    [dispatch, alerts],
  );

  const deleteAlert = useCallback(
    async (id: string) => {
      dispatch(removeAlert(id));
      await save(ALERTS_KEY, alerts.filter(a => a.id !== id));
    },
    [dispatch, alerts],
  );

  // ─── Prefs ────────────────────────────────────────────────────────────────

  const updateNotifPrefs = useCallback(
    async (partial: Partial<NotificationPrefs>) => {
      dispatch(updatePrefs(partial));
      const updated = { ...prefs, ...partial };
      await save(PREFS_KEY, updated);
    },
    [dispatch, prefs],
  );

  return {
    notifications,
    alerts,
    prefs,
    unreadCount,
    pushNotification,
    readNotification,
    readAll,
    clearNotifications,
    createAlert,
    deleteAlert,
    updateNotifPrefs,
  };
};
