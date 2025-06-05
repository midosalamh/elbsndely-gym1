import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsAPI } from '../../services/api';

interface ReportsState {
  dashboardData: any;
  revenueReport: any;
  membersReport: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  dashboardData: null,
  revenueReport: null,
  membersReport: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getDashboard = createAsyncThunk(
  'reports/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getDashboard();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب بيانات لوحة التحكم');
    }
  }
);

export const getRevenueReport = createAsyncThunk(
  'reports/getRevenueReport',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getRevenueReport(params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب تقرير الإيرادات');
    }
  }
);

export const getMembersReport = createAsyncThunk(
  'reports/getMembersReport',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getMembersReport(params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب تقرير الأعضاء');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get dashboard
      .addCase(getDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
        state.error = null;
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get revenue report
      .addCase(getRevenueReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRevenueReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueReport = action.payload;
        state.error = null;
      })
      .addCase(getRevenueReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get members report
      .addCase(getMembersReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMembersReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.membersReport = action.payload;
        state.error = null;
      })
      .addCase(getMembersReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = reportsSlice.actions;
export default reportsSlice.reducer;
