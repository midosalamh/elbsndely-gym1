import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { memberAPI } from '../../services/api';

interface MessageState {
  messages: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  isLoading: false,
  error: null,
};

export const getMessages = createAsyncThunk(
  'message/getMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await memberAPI.getMessages();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الرسائل');
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'message/markMessageAsRead',
  async (messageId: string, { rejectWithValue }) => {
    try {
      await memberAPI.markMessageAsRead(messageId);
      return messageId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث حالة الرسالة');
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
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
        state.error = null;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const messageIndex = state.messages.findIndex(m => m.id === action.payload);
        if (messageIndex !== -1) {
          state.messages[messageIndex].is_read = true;
        }
      });
  },
});

export const { clearError } = messageSlice.actions;
export default messageSlice.reducer;
