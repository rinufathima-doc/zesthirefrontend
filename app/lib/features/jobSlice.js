
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  error: null,
  navTheme: "default",
};

export const jobSlice = createSlice({
  name: "job",
  initialState,

  reducers: {
    // Login: Save user information in Redux
    setUser: (state, action) => {
      state.user = {
        ...action.payload,
        isLoggedIn: true,
      };
    },

    // Restore user after page refresh
    restoreUser: (state, action) => {
      state.user = {
        ...action.payload,
        isLoggedIn: true,
      };
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    // Logout: Clear user information
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },

    setNavTheme: (state, action) => {
      state.navTheme = action.payload;
    },
  },
});

export const {
  setUser,
  restoreUser,
  setLoading,
  setError,
  logout,
  setNavTheme,
} = jobSlice.actions;

export default jobSlice.reducer;
