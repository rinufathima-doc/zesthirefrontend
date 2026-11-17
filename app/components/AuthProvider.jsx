"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../lib/features/jobSlice";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check localStorage on page load / refresh
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    const isValidToken = token && token !== "null" && token !== "undefined";

    if (isValidToken) {
      let parsedUser = {};
      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : {};
      } catch (err) {
        console.error("Failed to parse stored user data:", err);
      }

      // Hydrate Redux state so refresh doesn't log you out
      dispatch(
        setUser({
          ...parsedUser,
          id: userId || parsedUser._id,
          role: role || parsedUser.role,
          token: token,
          isLoggedIn: true,
        })
      );
    }
  }, [dispatch]);

  return <>{children}</>;
}