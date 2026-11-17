import { configureStore } from '@reduxjs/toolkit';
import jobReducer from '../lib/features/jobSlice';
import profileReducer from '../lib/features/profile/profileSlice';

export const store = configureStore({
  reducer: {
    job: jobReducer,
    profile: profileReducer,
  },
});