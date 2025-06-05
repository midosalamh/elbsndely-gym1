import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { memberAPI } from '../../services/api';

interface SubscriptionState {
  currentSubscription: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  currentSubscription: null,
  isLoading: false,
  error: null,
};

export const getCurrentSubscription = createAsyncThunk(
  'subscription/getCurrentSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await memberAPI.getCurrentSubscription();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب بيانات الاشتراك');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload.subscription;
        state.error = null;
      })
      .addCase(getCurrentSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
