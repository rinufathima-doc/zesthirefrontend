"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { setUser, logout } from "../lib/features/jobSlice";

// Use 127.0.0.1 to avoid Windows localhost IPv6 connection bugs
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear stale session tokens and cookies when landing on the login page
  useEffect(() => {
    localStorage.clear();
    // Clear cookies as well on fresh load of login page
    document.cookie = "token=; path=/; max-age=0;";
    document.cookie = "employertoken=; path=/; max-age=0;";
    document.cookie = "role=; path=/; max-age=0;";
    dispatch(logout());
  }, [dispatch]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid email or password");
        return; // Exits cleanly without triggering the Next.js red error overlay
      }

      // --- STANDARDIZED DATA EXTRACTION ---
      const loggedUser = data.user || data.result || data;
      const userToken = data.token || loggedUser.token;
      
      // Look for role across all possible property names and normalize to lowercase
      let userRole = loggedUser.role || loggedUser.userType || data.role || data.userType || "";
      userRole = userRole.toLowerCase().trim();

      // Normalize role aliases (e.g. "job_seeker" -> "jobseeker")
      if (userRole === "job_seeker") userRole = "jobseeker";

      const userId = loggedUser._id || loggedUser.id || loggedUser.userId || "";

      // Validate that we actually got critical auth details
      if (!userToken) {
        toast.error("Authentication token missing from server response.");
        return;
      }

      if (!userRole) {
        toast.error("User role could not be determined from server response.");
        return;
      }

      // --- GUARANTEED LOCALSTORAGE PERSISTENCE ---
      localStorage.setItem("token", userToken);
      localStorage.setItem("employertoken", userToken);
      localStorage.setItem("role", userRole);
      localStorage.setItem("userId", userId);
      
      // Store a clean standardized user object
      const standardizedUserSession = {
        ...loggedUser,
        id: userId,
        role: userRole,
        token: userToken,
      };
      localStorage.setItem("user", JSON.stringify(standardizedUserSession));

      // --- GUARANTEED COOKIE PERSISTENCE FOR NEXT.JS MIDDLEWARE ---
      // Setting cookies with max-age=86400 (24 hours) and SameSite=Lax
      document.cookie = `token=${userToken}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `employertoken=${userToken}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `role=${userRole}; path=/; max-age=86400; SameSite=Lax`;

      // Dispatch standardized payload to Redux
      dispatch(setUser(standardizedUserSession));

      toast.success("Login successful!");

      // --- RELIABLE ROUTE REDIRECTION ---
      if (userRole === "jobseeker") {
        router.push("/jobseeker/dashboard");
      } else if (userRole === "employer") {
        router.push("/employer/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full mx-auto space-y-8">
          
          {/* BRAND LOGO HEADER */}
          <div className="text-center flex flex-col items-center select-none">
            <Link href="/" className="flex flex-col items-center group">
              <div className="flex items-center text-3xl sm:text-4xl font-black tracking-tight leading-none text-[#2c3e50]">
                Z
                <span className="relative inline-block">
                  E
                  {/* Green Leaf Accent */}
                  <svg
                    className="w-3.5 h-3.5 text-[#8cc63f] absolute -top-1.5 left-0 transform -rotate-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.0001 3C17.0001 3 13.0001 4 10.0001 8C7.00012 12 7.00012 16 7.00012 16C7.00012 16 11.0001 16 15.0001 12C19.0001 8 17.0001 3 17.0001 3Z" />
                  </svg>
                </span>
                ST
                <span className="text-[#8cc63f]">HIRE</span>
              </div>
              <span className="text-xs font-semibold tracking-wide text-slate-500 mt-1.5">
                Your Next Opportunity Awaits
              </span>
            </Link>
          </div>

          {/* LOGIN CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-8 tracking-tight text-center">
              Log In To Your Account
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-6" autoComplete="off">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="off"
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-11 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.96 9.96 0 013.985-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.16-6.161a3 3 0 104.243 4.243" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold py-3.5 px-6 rounded-xl transition shadow-md cursor-pointer text-sm tracking-wide disabled:opacity-50"
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
              Don't have an account?{" "}
              <span className="font-semibold text-slate-800">
                Register as{" "}
                <Link href="/signup/jobseeker" className="text-[#8cc63f] hover:underline font-bold">
                  Jobseeker
                </Link>{" "}
                or{" "}
                <Link href="/signup/employer" className="text-[#8cc63f] hover:underline font-bold">
                  Employer
                </Link>
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}