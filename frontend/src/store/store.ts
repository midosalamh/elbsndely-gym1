import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import membersReducer from './slices/membersSlice';
import subscriptionsReducer from './slices/subscriptionsSlice';
import paymentsReducer from './slices/paymentsSlice';
import reportsReducer from './slices/reportsSlice';
import messagesReducer from './slices/messagesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    subscriptions: subscriptionsReducer,
    payments: paymentsReducer,
    reports: reportsReducer,
    messages: messagesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
