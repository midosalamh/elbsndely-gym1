import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messagesAPI } from '../../services/api';

interface MessagesState {
  messages: any[];
  templates: any;
  pagination: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  messages: [],
  templates: null,
  pagination: null,
  isLoading: false,
  error: null,
};

export const getMessages = createAsyncThunk(
  'messages/getMessages',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.getMessages(params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الرسائل');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData: any, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.sendMessage(messageData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إرسال الرسالة');
    }
  }
);

export const sendBulkMessage = createAsyncThunk(
  'messages/sendBulkMessage',
  async (messageData: any, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.sendBulkMessage(messageData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إرسال الرسائل المجمعة');
    }
  }
);

export const getTemplates = createAsyncThunk(
  'messages/getTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.getTemplates();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب قوالب الرسائل');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.unshift(action.payload.message);
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendBulkMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendBulkMessage.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendBulkMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload.templates;
        state.error = null;
      })
      .addCase(getTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = messagesSlice.actions;
export default messagesSlice.reducer;
