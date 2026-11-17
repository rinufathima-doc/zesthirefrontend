"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function EmployerLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // --- LIVE DIAGNOSTIC TRACE ---
    const rawToken = localStorage.getItem("token") || localStorage.getItem("employertoken");
    let userRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");

    console.log("=== EMPLOYER LAYOUT GUARD DEBUG ===");
    console.log("Raw Token Found:", !!rawToken);
    console.log("Raw Role Found:", userRole);
    console.log("Stored User JSON:", storedUser);

    if (!userRole && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        userRole = parsed.role || parsed.userType;
        console.log("Parsed Role from User JSON:", userRole);
      } catch (e) {
        console.error("Failed to parse user JSON:", e);
      }
    }

    const normalizedRole = (userRole || "").toLowerCase().trim();
    console.log("Normalized Role:", normalizedRole);

    // 1. Check if token is missing
    if (!rawToken || rawToken === "null" || rawToken === "undefined") {
      console.warn("GUARD FAILED: No valid token found. Redirecting to login.");
      toast.error("Please log in as an employer.");
      router.replace("/login");
      return;
    }

    // 2. Block jobseekers
    if (normalizedRole === "jobseeker" || normalizedRole === "job_seeker") {
      console.warn("GUARD FAILED: Jobseeker tried to access employer layout. Redirecting.");
      toast.error("Unauthorized access.");
      router.replace("/jobseeker/dashboard");
      return;
    }

    // 3. Ensure role is employer
    if (normalizedRole !== "employer") {
      console.warn("GUARD FAILED: Role is not employer. Redirecting to login.");
      toast.error("Employer access required.");
      router.replace("/login");
      return;
    }

    console.log("GUARD PASSED: Employer authorized successfully.");
    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Verifying employer security guard...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}