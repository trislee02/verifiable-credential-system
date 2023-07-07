import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';

export const dataStore = configureStore({
    reducer: {
        authSlice: authSlice.reducer,
    }
});