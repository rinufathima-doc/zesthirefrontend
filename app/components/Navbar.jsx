"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { logout } from "../lib/features/jobSlice";

// Use 127.0.0.1 to avoid Windows localhost IPv6 connection bugs
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const cleanToken = token.replace(/^Bearer\s+/i, "");
    const parts = cleanToken.split(".");
    if (parts.length !== 3) return true; // Invalid JWT structure

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;

    // Add a 5-second buffer to account for minor clock discrepancies between client and server
    return exp * 1000 < Date.now() - 5000;
  } catch (err) {
    console.error("Token validation error:", err);
    return false; // Return false on parsing error to prevent accidental session wipes
  }
};

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // Always start with mounted as false so server and initial client render match identically
  const [mounted, setMounted] = useState(false);
  const [showSignUpDropdown, setShowSignUpDropdown] = useState(false);
  const [showEmployerProfileDropdown, setShowEmployerProfileDropdown] = useState(false);
  const [showJobseekerProfileDropdown, setShowJobseekerProfileDropdown] = useState(false);
  
  const [employerProfile, setEmployerProfile] = useState({ companyName: "", email: "" });
  const [storedAuth, setStoredAuth] = useState({ isLoggedIn: false, role: "", userId: "", companyName: "", email: "" });

  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const jobseekerDropdownRef = useRef(null);

  const { user } = useSelector((state) => state.job || state.auth || {});

  useEffect(() => {
    setMounted(true);

    const rawToken = localStorage.getItem("token");
    
    // STRICT CHECK: If token is missing, expired, or invalid, purge local storage immediately
    if (!rawToken || isTokenExpired(rawToken)) {
      localStorage.clear();
      document.cookie = "token=; path=/; max-age=0;";
      document.cookie = "employertoken=; path=/; max-age=0;";
      document.cookie = "role=; path=/; max-age=0;";
      setStoredAuth({ isLoggedIn: false, role: "", userId: "", companyName: "", email: "" });
      dispatch(logout());
      return;
    }

    const localUser = localStorage.getItem("user");
    const localRole = localStorage.getItem("role");
    const localUserId = localStorage.getItem("userId");

    if (rawToken && localRole) {
      let parsedUser = {};
      try {
        parsedUser = localUser ? JSON.parse(localUser) : {};
      } catch (e) {}

      setStoredAuth({
        isLoggedIn: true,
        role: user?.role || localRole || parsedUser.role || "",
        userId: user?.employerId || user?.id || user?._id || localUserId || parsedUser._id || "",
        companyName: parsedUser.companyName || parsedUser.name || "",
        email: parsedUser.email || "",
      });
    }
  }, [dispatch, user]);

  useEffect(() => {
    const fetchEmployerNavbarProfile = async () => {
      const rawToken = localStorage.getItem("token");
      const targetId = storedAuth.userId || user?.employerId || user?.id || user?._id;
      
      if (rawToken && storedAuth.role === "employer" && targetId) {
        try {
          const res = await fetch(`${API_URL}/api/jobs/company/${targetId}`, {
            headers: { Authorization: `Bearer ${rawToken.replace(/^Bearer\s+/i, "")}` },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setEmployerProfile({
                companyName: data.user.companyName || data.user.name || "My Company",
                email: data.user.email || "",
              });
            }
          }
        } catch (err) {
          console.error("Failed to load navbar profile:", err);
        }
      }
    };

    if (mounted && storedAuth.isLoggedIn && storedAuth.role === "employer") {
      fetchEmployerNavbarProfile();
    }
  }, [mounted, storedAuth.isLoggedIn, storedAuth.role, storedAuth.userId, user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSignUpDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowEmployerProfileDropdown(false);
      }
      if (jobseekerDropdownRef.current && !jobseekerDropdownRef.current.contains(event.target)) {
        setShowJobseekerProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    
    document.cookie = "token=; path=/; max-age=0;";
    document.cookie = "employertoken=; path=/; max-age=0;";
    document.cookie = "role=; path=/; max-age=0;";

    setStoredAuth({ isLoggedIn: false, role: "", userId: "", companyName: "", email: "" });
    dispatch(logout());
    setShowEmployerProfileDropdown(false);
    setShowJobseekerProfileDropdown(false);
    toast.success("Logged out successfully!");
    router.push("/");
  };

  const safePathname = pathname || "";
  const isDarkHeroOverlay =
    safePathname === "/" ||
    safePathname === "/jobs-list" ||
    safePathname === "/companies" ||
    safePathname === "/employer/dashboard";

  // Strict validation: Must have a token that is not expired to be logged in
  const rawTokenCheck = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const hasValidToken = Boolean(rawTokenCheck) && !isTokenExpired(rawTokenCheck);
  const isLoggedIn = mounted && hasValidToken && (Boolean(user?.isLoggedIn) || storedAuth.isLoggedIn);
  const userRole = isLoggedIn ? (user?.role || storedAuth.role) : "";

  const companyName = user?.companyName || user?.name || employerProfile.companyName || storedAuth.companyName || "My Company";
  const userEmail = user?.email || employerProfile.email || storedAuth.email || "employer@gmail.com";
  const employerId = user?.employerId || user?.id || user?._id || storedAuth.userId;

  const activeIsEmployer = mounted && isLoggedIn && userRole === "employer";
  const activeIsJobseeker = mounted && isLoggedIn && userRole === "jobseeker";

  const isInternalJobseekerRoute = safePathname.startsWith("/jobseeker/") && safePathname !== "/jobseeker/apply";
  if (activeIsJobseeker && isInternalJobseekerRoute) {
    return null;
  }

  return (
    <nav
      className={`w-full z-50 transition-colors duration-300 ${
        isDarkHeroOverlay
          ? "absolute top-0 left-0 right-0 bg-transparent text-white"
          : "relative bg-white text-slate-800 border-b border-slate-200 shadow-xs"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* BRAND LOGO */}
        <Link href="/" className="flex flex-col justify-center group select-none py-1">
          <div className="flex items-center text-2xl sm:text-3xl font-black tracking-tight leading-none">
            <span className={`${isDarkHeroOverlay ? "text-white" : "text-[#2c3e50]"} flex items-center font-black`}>
              Z
              <span className="relative inline-block">
                E
                <svg
                  className="w-3 h-3 text-[#8cc63f] absolute -top-1 left-0 transform -rotate-12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.0001 3C17.0001 3 13.0001 4 10.0001 8C7.00012 12 7.00012 16 7.00012 16C7.00012 16 11.0001 16 15.0001 12C19.0001 8 17.0001 3 17.0001 3Z" />
                </svg>
              </span>
              ST
            </span>
            <span className="text-[#8cc63f] font-black">HIRE</span>
          </div>
          <span className={`text-[10px] sm:text-[10.5px] font-semibold tracking-wide -mt-1 ${isDarkHeroOverlay ? "text-slate-300" : "text-slate-500"}`}>
            Your Next Opportunity Awaits
          </span>
        </Link>

        {/* NAVIGATION LINKS */}
        <div
          className={`hidden md:flex items-center space-x-8 text-sm font-medium ${
            isDarkHeroOverlay ? "text-slate-200" : "text-slate-600"
          }`}
        >
          {!mounted ? (
            <>
              <Link href="/" className="hover:text-[#8cc63f] transition">Home</Link>
              <Link href="/jobs-list" className="hover:text-[#8cc63f] transition">Find Jobs</Link>
              <Link href="/companies" className="hover:text-[#8cc63f] transition">Companies</Link>
            </>
          ) : activeIsEmployer ? (
            <>
              <Link href="/employer/dashboard" className="hover:text-[#8cc63f] transition">Dashboard</Link>
              <Link href="/employer/post-job" className="hover:text-[#8cc63f] transition">Post a Job</Link>
              <Link href="/employer/manage-jobs" className="hover:text-[#8cc63f] transition">Manage Jobs</Link>
              <Link href="/employer/applications" className="hover:text-[#8cc63f] transition">Applicants</Link>
            </>
          ) : activeIsJobseeker ? (
            <>
              <Link href="/jobseeker/dashboard" className="hover:text-[#8cc63f] transition">Dashboard</Link>
              <Link href="/jobs-list" className="hover:text-[#8cc63f] transition">Find Jobs</Link>
              <Link href="/jobseeker/saved-jobs" className="hover:text-[#8cc63f] transition">Saved Jobs</Link>
              <Link href="/jobseeker/my-applications" className="hover:text-[#8cc63f] transition">My Applications</Link>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-[#8cc63f] transition">Home</Link>
              <Link href="/jobs-list" className="hover:text-[#8cc63f] transition">Find Jobs</Link>
              <Link href="/companies" className="hover:text-[#8cc63f] transition">Companies</Link>
            </>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center space-x-5">
          {!mounted ? (
            <Link href="/login" className={`text-sm font-medium transition ${isDarkHeroOverlay ? "text-white hover:text-[#8cc63f]" : "text-slate-700 hover:text-[#8cc63f]"}`}>
              Login
            </Link>
          ) : activeIsEmployer ? (
            <div className="flex items-center space-x-4">
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowEmployerProfileDropdown(!showEmployerProfileDropdown)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition border border-slate-700 shadow-sm cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#8cc63f] text-slate-950 flex items-center justify-center font-bold text-xs">
                    👤
                  </div>
                  <span>Employer</span>
                  <span className="text-xs">▼</span>
                </button>

                {showEmployerProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden text-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#8cc63f]/20 border border-[#8cc63f] flex items-center justify-center text-lg">
                        👤
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="font-bold text-slate-900 truncate">{companyName}</p>
                        <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                      </div>
                    </div>

                    <div className="py-2 text-left">
                      <Link
                        href={employerId ? `/company/${employerId}` : "/employer/dashboard"}
                        onClick={() => setShowEmployerProfileDropdown(false)}
                        className="flex items-center px-4 py-2.5 hover:bg-slate-100 transition font-medium text-slate-700 hover:text-slate-900"
                      >
                        Company Profile
                      </Link>
                      <Link
                        href="/employer/change-password"
                        onClick={() => setShowEmployerProfileDropdown(false)}
                        className="flex items-center px-4 py-2.5 hover:bg-slate-100 transition font-medium text-slate-700 hover:text-slate-900"
                      >
                        Change Password
                      </Link>
                    </div>

                    <div className="border-t border-slate-200 py-1 text-left bg-slate-50/50">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-red-600 hover:bg-red-50 font-semibold transition cursor-pointer"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeIsJobseeker ? (
            <div className="flex items-center space-x-4">
              <div className="relative" ref={jobseekerDropdownRef}>
                <button
                  onClick={() => setShowJobseekerProfileDropdown(!showJobseekerProfileDropdown)}
                  className="w-10 h-10 rounded-full bg-[#8cc63f] hover:bg-[#7cb342] flex items-center justify-center text-slate-950 transition shadow-md cursor-pointer"
                  title="Profile Menu"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </button>

                {showJobseekerProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden text-sm">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 text-left">
                      <p className="font-bold text-slate-900 truncate">{user?.name || "Job Seeker"}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || "user@example.com"}</p>
                    </div>
                    <div className="py-2 text-left">
                      <Link
                        href="/jobseeker/profile"
                        onClick={() => setShowJobseekerProfileDropdown(false)}
                        className="flex items-center px-4 py-2 hover:bg-slate-100 transition font-medium text-slate-700"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/jobseeker/edit-profile"
                        onClick={() => setShowJobseekerProfileDropdown(false)}
                        className="flex items-center px-4 py-2 hover:bg-slate-100 transition font-medium text-slate-700"
                      >
                        Edit Profile
                      </Link>
                    </div>
                    <div className="border-t border-slate-200 py-1 text-left bg-slate-50/50">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 font-semibold transition cursor-pointer"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-medium transition ${
                  isDarkHeroOverlay ? "text-white hover:text-[#8cc63f]" : "text-slate-700 hover:text-[#8cc63f]"
                }`}
              >
                Login
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowSignUpDropdown(!showSignUpDropdown)}
                  className="flex items-center space-x-1 px-5 py-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-900 font-bold rounded text-sm transition shadow-md cursor-pointer"
                >
                  <span>Register</span>
                  <span className="text-xs ml-0.5">▾</span>
                </button>

                {showSignUpDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 text-slate-800 z-50 text-sm border border-slate-100">
                    <Link
                      href="/signup/jobseeker"
                      onClick={() => setShowSignUpDropdown(false)}
                      className="block px-4 py-2 hover:bg-slate-100 transition font-medium text-left"
                    >
                      As Jobseeker
                    </Link>
                    <Link
                      href="/signup/employer"
                      onClick={() => setShowSignUpDropdown(false)}
                      className="block px-4 py-2 hover:bg-slate-100 transition font-medium text-left"
                    >
                      As Employer
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}