import { createSlice } from "@reduxjs/toolkit";

let appState = { privateKey: null, openPrivateKeyForm: null };

export const appSlice = createSlice({
  name: "appSlice",
  initialState: appState,
  reducers: {
    setPrivateKey(state, action) {
      state.privateKey = action.payload.privateKey;
      state.openPrivateKeyForm = true;
    },
    setClosePrivateKeyForm(state){
      state.openPrivateKeyForm = false;
    },
    setOpenPrivateKeyForm(state){
      state.openPrivateKeyForm = true;
    }
  },
});

export const appActions = appSlice.actions;
