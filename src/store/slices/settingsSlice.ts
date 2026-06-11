import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode } from '../../theme';

interface SettingsState {
  themeMode: ThemeMode;
  autoAnalysis: boolean;
  notificationsEnabled: boolean;
  defaultMarket: string;
}

const initialState: SettingsState = {
  themeMode: 'dark',
  autoAnalysis: false,
  notificationsEnabled: true,
  defaultMarket: 'BIST',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
    toggleAutoAnalysis(state) {
      state.autoAnalysis = !state.autoAnalysis;
    },
    toggleNotifications(state) {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    setDefaultMarket(state, action: PayloadAction<string>) {
      state.defaultMarket = action.payload;
    },
    updateSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setThemeMode, toggleAutoAnalysis, toggleNotifications,
  setDefaultMarket, updateSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
