import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name: "authSlice",
    initialState: { isAuthenticated: false },
    reducers: {
        login(state) {
            state.isAuthenticated = true;
        },
        logout(state) {
            state.isAuthenticated = false;
        }
    }
});

export const authActions = authSlice.actions;