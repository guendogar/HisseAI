import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Prediction } from '../../types';

interface AiState {
  predictions: Prediction[];
  loading: boolean;
  currentPrediction: Prediction | null;
  error: string | null;
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    successRate: number;
    avgConfidence: number;
    totalDataAnalyzed: number;
    totalNewsAnalyzed: number;
  };
}

const initialState: AiState = {
  predictions: [],
  loading: false,
  currentPrediction: null,
  error: null,
  stats: {
    total: 0,
    correct: 0,
    incorrect: 0,
    successRate: 0,
    avgConfidence: 0,
    totalDataAnalyzed: 0,
    totalNewsAnalyzed: 0,
  },
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setPredictions(state, action: PayloadAction<Prediction[]>) {
      state.predictions = action.payload;
      const resolved = action.payload.filter(p => p.isCorrect !== undefined);
      state.stats.total = action.payload.length;
      state.stats.correct = resolved.filter(p => p.isCorrect).length;
      state.stats.incorrect = resolved.filter(p => !p.isCorrect).length;
      state.stats.successRate = resolved.length ? (state.stats.correct / resolved.length) * 100 : 0;
      state.stats.avgConfidence = action.payload.length
        ? action.payload.reduce((a, p) => a + p.confidenceScore, 0) / action.payload.length
        : 0;
    },
    addPrediction(state, action: PayloadAction<Prediction>) {
      state.predictions.unshift(action.payload);
    },
    setCurrentPrediction(state, action: PayloadAction<Prediction | null>) {
      state.currentPrediction = action.payload;
    },
    clearPredictions(state) {
      state.predictions = [];
      state.stats = initialState.stats;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    updateStats(state, action: PayloadAction<Partial<AiState['stats']>>) {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
});

export const {
  setPredictions, addPrediction, setCurrentPrediction,
  clearPredictions, setLoading, setError, updateStats,
} = aiSlice.actions;
export default aiSlice.reducer;
