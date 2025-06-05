import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { membersAPI } from '../../services/api';

interface MembersState {
  members: any[];
  currentMember: any;
  pagination: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: MembersState = {
  members: [],
  currentMember: null,
  pagination: null,
  isLoading: false,
  error: null,
};

export const getMembers = createAsyncThunk(
  'members/getMembers',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await membersAPI.getMembers(params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الأعضاء');
    }
  }
);

export const getMember = createAsyncThunk(
  'members/getMember',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await membersAPI.getMember(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب بيانات العضو');
    }
  }
);

export const createMember = createAsyncThunk(
  'members/createMember',
  async (memberData: any, { rejectWithValue }) => {
    try {
      const response = await membersAPI.createMember(memberData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء العضو');
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/updateMember',
  async ({ id, memberData }: { id: string; memberData: any }, { rejectWithValue }) => {
    try {
      const response = await membersAPI.updateMember(id, memberData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث العضو');
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (id: string, { rejectWithValue }) => {
    try {
      await membersAPI.deleteMember(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف العضو');
    }
  }
);

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMember: (state) => {
      state.currentMember = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload.members;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMember = action.payload.member;
        state.error = null;
      })
      .addCase(getMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members.unshift(action.payload.member);
        state.error = null;
      })
      .addCase(createMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.members.findIndex(m => m.id === action.payload.member.id);
        if (index !== -1) {
          state.members[index] = action.payload.member;
        }
        if (state.currentMember?.id === action.payload.member.id) {
          state.currentMember = action.payload.member;
        }
        state.error = null;
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = state.members.filter(m => m.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentMember } = membersSlice.actions;
export default membersSlice.reducer;
