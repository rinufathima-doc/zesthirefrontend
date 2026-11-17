import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for updating employer profile
export const updateEmployerProfile = createAsyncThunk(
  "profile/updateEmployerProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/profile/employer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update employer profile");
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating candidate profile
export const updateCandidateProfile = createAsyncThunk(
  "profile/updateCandidateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/profile/candidate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update candidate profile");
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating account settings
export const updateAccountSettings = createAsyncThunk(
  "profile/updateAccountSettings",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/account/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update account settings");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  employerData: null,
  candidateData: null,
  loading: false,
  error: null,
  successMessage: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Employer Profile
      .addCase(updateEmployerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateEmployerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.employerData = action.payload;
        state.successMessage = "Employer profile updated successfully!";
      })
      .addCase(updateEmployerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Candidate Profile
      .addCase(updateCandidateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCandidateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.candidateData = action.payload;
        state.successMessage = "Candidate profile updated successfully!";
      })
      .addCase(updateCandidateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Account Settings
      .addCase(updateAccountSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAccountSettings.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Account settings updated successfully!";
      })
      .addCase(updateAccountSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileStatus } = profileSlice.actions;
export default profileSlice.reducer;