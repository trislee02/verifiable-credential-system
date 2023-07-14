import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./slices/authSlice";
import { appSlice } from "./slices/appSlice";

export const dataStore = configureStore({
  reducer: {
    authSlice: authSlice.reducer,
    appSlice: appSlice.reducer
  },
});
