"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";


export default function JobseekerDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    shortlisted: 0,
    rejected: 0,
    saved: 0,
  });
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // 1. Fetch Jobseeker's Applications
        const appRes = await fetch("http://localhost:5000/api/applications", { headers });
        const appData = await appRes.json();
        
        if (appRes.ok) {
          const apps = appData.applications || appData || [];
          setApplications(apps);

          // Calculate counts by status
          const total = apps.length;
          const applied = apps.filter((a) => a.status === "Pending" || !a.status).length;
          const shortlisted = apps.filter((a) => a.status === "Shortlisted").length;
          const rejected = apps.filter((a) => a.status === "Rejected").length;

          setStats((prev) => ({
            ...prev,
            total,
            applied,
            shortlisted,
            rejected,
          }));
        }

        // 2. Fetch Saved Jobs (if endpoint exists)
        try {
          const savedRes = await fetch("http://localhost:5000/api/jobseeker/saved-jobs", { headers });
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            const saved = savedData.savedJobs || savedData || [];
            setSavedJobs(saved);
            setStats((prev) => ({ ...prev, saved: saved.length }));
          }
        } catch (e) {
          console.log("Saved jobs endpoint optional or not configured yet.");
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      
      {/* TOP WELCOME BANNER */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-lime-50 border border-emerald-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-xs">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Welcome back!
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Find your dream job and take the next step in your career.
          </p>
          <div className="pt-2">
            <Link
              href="/jobs-list"
              className="inline-flex items-center space-x-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold px-6 py-3 rounded-2xl text-sm transition shadow-sm"
            >
              <span>Explore Jobs</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
        <div className="mt-6 md:mt-0 text-[#8cc63f]">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* STATS METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Applications</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-50 text-lime-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.saved}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Saved Jobs</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.shortlisted}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Shortlisted</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.rejected}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Rejected</p>
          </div>
        </div>
      </div>

      {/* APPLICATIONS & STATUS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Applications List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <Link href="/jobseeker/my-applications" className="text-xs font-bold text-[#8cc63f] hover:underline">
              See All &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-sm text-slate-400">Loading your applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
              You haven't applied to any jobs yet. <Link href="/jobs-list" className="text-[#8cc63f] font-bold hover:underline">Explore listings</Link> to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div key={app._id} className="p-4 border border-slate-100 hover:border-slate-200 rounded-2xl flex items-center justify-between transition bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{app.job?.title || "Position"}</h3>
                    <p className="text-xs text-slate-500">
                      {app.job?.companyName || "Company"} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                    app.status === "Shortlisted" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    app.status === "Rejected" ? "bg-red-50 text-red-700 border border-red-200" :
                    "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {app.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Status & Quick Actions */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Application Status</h2>
              <Link href="/jobseeker/my-applications" className="text-xs font-bold text-[#8cc63f] hover:underline">
                See All &rarr;
              </Link>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="w-36 h-36 rounded-full border-8 border-slate-100 border-t-[#8cc63f] flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900">{stats.total}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Applications</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Pending: {stats.applied}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Shortlisted: {stats.shortlisted}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Rejected: {stats.rejected}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-3 text-center">
              <Link href="/jobs-list" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition flex flex-col items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">Search</p>
              </Link>
              <Link href="/jobseeker/profile" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition flex flex-col items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">Profile</p>
              </Link>
              <Link href="/jobseeker/resume" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition flex flex-col items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">Resume</p>
              </Link>
              <Link href="/jobseeker/my-applications" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition flex flex-col items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">Applied</p>
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}