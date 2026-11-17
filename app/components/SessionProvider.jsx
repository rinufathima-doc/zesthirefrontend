"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/features/jobSlice";

export default function SessionProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    async function verifySession() {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // or handle via HTTP-only cookies
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Re-populate Redux store with MongoDB user data
          dispatch(
            setUser({
              isLoggedIn: true,
              name: data.name,
              email: data.email,
              role: data.role, // "employer" or "jobseeker"
            })
          );
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      }
    }

    verifySession();
  }, [dispatch]);

  return <>{children}</>;
}