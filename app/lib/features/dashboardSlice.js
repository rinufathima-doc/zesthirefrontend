
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activePage: "Dashboard",
  savedJobs: [],
  notifications: 3,
  jobs: [
    {
      id: 1,
      company: "Google",
      initial: "G",
      color: "#4285F4",
      title: "Frontend Developer",
      location: "Bengaluru, India",
      type: "Full-time",
      salary: "₹8L – ₹12L per annum",
    },
    {
      id: 2,
      company: "Microsoft",
      initial: "M",
      color: "#00A4EF",
      title: "Software Engineer",
      location: "Hyderabad, India",
      type: "Full-time",
      salary: "₹10L – ₹15L per annum",
    },
    {
      id: 3,
      company: "Amazon",
      initial: "a",
      color: "#232F3E",
      title: "Full Stack Developer",
      location: "Chennai, India",
      type: "Full-time",
      salary: "₹7L – ₹11L per annum",
    },
    {
      id: 4,
      company: "TCS",
      initial: "T",
      color: "#E91E8B",
      title: "React Developer",
      location: "Kochi, India",
      type: "Full-time",
      salary: "₹5L – ₹9L per annum",
    },
  ],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },

    toggleSavedJob: (state, action) => {
      const jobId = action.payload;

      if (state.savedJobs.includes(jobId)) {
        state.savedJobs = state.savedJobs.filter(
          (id) => id !== jobId
        );
      } else {
        state.savedJobs.push(jobId);
      }
    },

    clearNotifications: (state) => {
      state.notifications = 0;
    },
  },
});

export const {
  setActivePage,
  toggleSavedJob,
  clearNotifications,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
