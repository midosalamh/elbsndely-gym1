import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentsAPI } from '../../services/api';

interface PaymentsState {
  payments: any[];
  currentPayment: any;
  pagination: any;
  totals: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  payments: [],
  currentPayment: null,
  pagination: null,
  totals: null,
  isLoading: false,
  error: null,
};

export const getPayments = createAsyncThunk(
  'payments/getPayments',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getPayments(params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب المدفوعات');
    }
  }
);

export const getPayment = createAsyncThunk(
  'payments/getPayment',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getPayment(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب بيانات المدفوعة');
    }
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.createPayment(paymentData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء المدفوعة');
    }
  }
);

export const refundPayment = createAsyncThunk(
  'payments/refundPayment',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.refundPayment(id, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في استرداد المدفوعة');
    }
  }
);

export const getMemberPayments = createAsyncThunk(
  'payments/getMemberPayments',
  async (memberId: string, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getMemberPayments(memberId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب مدفوعات العضو');
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
        state.totals = action.payload.totals;
        state.error = null;
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload.payment;
        state.error = null;
      })
      .addCase(getPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments.unshift(action.payload.payment);
        state.error = null;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(refundPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.payments.findIndex(p => p.id === action.payload.payment.id);
        if (index !== -1) {
          state.payments[index] = action.payload.payment;
        }
        if (state.currentPayment?.id === action.payload.payment.id) {
          state.currentPayment = action.payload.payment;
        }
        state.error = null;
      })
      .addCase(refundPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getMemberPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMemberPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
        state.error = null;
      })
      .addCase(getMemberPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentPayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;
