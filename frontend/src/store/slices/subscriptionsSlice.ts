import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionsAPI } from '../../services/api';

interface SubscriptionsState {
  subscriptions: any[];
  subscriptionTypes: any[];
  pagination: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = {
  subscriptions: [],
  subscriptionTypes: [],
  pagination: null,
  isLoading: false,
  error: null,
};

export const getSubscriptions = createAsyncThunk(
  'subscriptions/getSubscriptions',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.getSubscriptions(params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الاشتراكات');
    }
  }
);

export const getSubscriptionTypes = createAsyncThunk(
  'subscriptions/getSubscriptionTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.getSubscriptionTypes();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب أنواع الاشتراكات');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/createSubscription',
  async (subscriptionData: any, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.createSubscription(subscriptionData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء الاشتراك');
    }
  }
);

export const freezeSubscription = createAsyncThunk(
  'subscriptions/freezeSubscription',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.freezeSubscription(id, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تجميد الاشتراك');
    }
  }
);

export const unfreezeSubscription = createAsyncThunk(
  'subscriptions/unfreezeSubscription',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.unfreezeSubscription(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إلغاء تجميد الاشتراك');
    }
  }
);

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload.subscriptions;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getSubscriptionTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubscriptionTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptionTypes = action.payload.subscription_types;
        state.error = null;
      })
      .addCase(getSubscriptionTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions.unshift(action.payload.subscription);
        state.error = null;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(freezeSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(freezeSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.subscriptions.findIndex(s => s.id === action.payload.subscription.id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload.subscription;
        }
        state.error = null;
      })
      .addCase(freezeSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(unfreezeSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unfreezeSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.subscriptions.findIndex(s => s.id === action.payload.subscription.id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload.subscription;
        }
        state.error = null;
      })
      .addCase(unfreezeSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
