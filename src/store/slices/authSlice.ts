import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens } from '../../types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
    setTokens(state, action: PayloadAction<AuthTokens | null>) {
      state.tokens = action.payload;
    },
    logout(state) {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setUser, setTokens, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
