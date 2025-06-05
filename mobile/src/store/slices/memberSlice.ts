import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { memberAPI } from '../../services/api';

interface MemberState {
  payments: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MemberState = {
  payments: [],
  isLoading: false,
  error: null,
};

export const getPaymentHistory = createAsyncThunk(
  'member/getPaymentHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await memberAPI.getPaymentHistory();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب تاريخ المدفوعات');
    }
  }
);

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
        state.error = null;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = memberSlice.actions;
export default memberSlice.reducer;
