"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../lib/features/jobSlice";
import { toast } from "react-hot-toast";

function JobseekerSidebarContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [authorized, setAuthorized] = useState(false);

  // Grab user from Redux store as well
  const { user } = useSelector((state) => state.job || state.auth || {});

  useEffect(() => {
    const token = localStorage.getItem("token");
    let userRole = localStorage.getItem("role");

    // Fallback: check parsed 'user' object in localStorage
    if (!userRole) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userRole = parsed.role || parsed.userType;
        } catch (e) {
          console.error("Failed to parse user session:", e);
        }
      }
    }

    // Also check Redux user state
    if (!userRole && user?.role) {
      userRole = user.role;
    }

    // 1. Check if token is missing or explicitly invalid
    if (!token || token === "null" || token === "undefined") {
      toast.error("Session expired. Please log in again.");
      router.replace("/login");
      return;
    }

    // 2. Normalize and check if role belongs to an employer or admin
    const normalizedRole = (userRole || "").toLowerCase().trim();
    const forbiddenRoles = ["employer", "recruiter", "company", "admin"];

    if (normalizedRole && forbiddenRoles.includes(normalizedRole)) {
      toast.error("Unauthorized access. Please log in as a jobseeker.");
      router.replace("/login");
      return;
    }

    // 3. If token exists but role is completely missing, force re-login
    if (!normalizedRole) {
      toast.error("Invalid session state. Please log in again.");
      router.replace("/login");
      return;
    }

    setAuthorized(true);
  }, [pathname, router, user]);

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
    toast.success("Logged out successfully!");
    router.replace("/login");
  };

  const menuItems = [
    { 
      name: "Dashboard", 
      href: "/jobseeker/dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ) 
    },
    { 
      name: "Search Jobs", 
      href: "/jobs-list", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ) 
    },
    { 
      name: "Saved Jobs", 
      href: "/jobseeker/saved-jobs", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ) 
    },
    { 
      name: "My Applications", 
      href: "/jobseeker/my-applications", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ) 
    },
    { 
      name: "My Profile", 
      href: "/jobseeker/profile", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ) 
    },
    { 
      name: "Resume", 
      href: "/jobseeker/resume", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ) 
    },
  ];

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Verifying secure access...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-72 bg-[#1e293b] text-slate-300 flex flex-col justify-between hidden lg:flex sticky top-0 h-screen border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800">
            <span className="text-lg font-black tracking-wider text-[#8cc63f]">ZESTHIRE</span>
          </div>

          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#8cc63f] text-slate-950 shadow-md font-bold"
                      : "hover:bg-slate-800 hover:text-white text-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

export default function JobseekerLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading layout...</p>
      </div>
    }>
      <JobseekerSidebarContent>{children}</JobseekerSidebarContent>
    </Suspense>
  );
}