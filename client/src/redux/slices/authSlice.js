import { createSlice } from "@reduxjs/toolkit";

let authState = { isAuthenticated: false, user: null, jwt: null };
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");
if (token && user) {
    authState = {
        isAuthenticated: true,
        user: JSON.parse(user),
        jwt: token
    }
}

export const authSlice = createSlice({
    name: "authSlice",
    initialState: authState,
    reducers: {
        login(state, action) {
            state.user = action.payload.user;
            state.jwt = action.payload.jwt;
            state.isAuthenticated = true;
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.jwt = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    }
});

export const authActions = authSlice.actions;