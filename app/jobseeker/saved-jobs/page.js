"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedJobs() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Fixed URL to match your /api/jobs router prefix
        const res = await fetch("http://localhost:5000/api/jobs/saved-jobs", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          const list = data.savedJobs || data || [];
          // Handle populated job objects cleanly and filter out any deleted/null jobs
          const formattedJobs = Array.isArray(list)
            ? list.map((item) => item.job || item).filter(Boolean)
            : [];
          setSavedJobs(formattedJobs);
        } else {
          toast.error(data.message || "Failed to load saved jobs");
        }
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
        toast.error("Network error while loading saved jobs");
      } finally {
        setLoading(false);
      }
    }

    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      // Fixed URL to match your /api/jobs router prefix
      const res = await fetch(`http://localhost:5000/api/jobs/saved-jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSavedJobs((prev) => prev.filter((job) => (job._id || job.id) !== jobId));
        toast.success("Job removed from saved list");
      } else {
        toast.error(data.message || "Failed to remove saved job");
      }
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] pb-16 pt-8">
      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Minimal Clean Header */}
        <div className="mb-8 space-y-1">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <Link href="/jobseeker/dashboard" className="hover:text-slate-800 transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#06b6d4] font-medium">Saved Jobs</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Jobs
          </h1>
          <p className="text-xs text-slate-500">
            Manage and track the positions you have bookmarked.
          </p>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-medium">
            Loading saved jobs...
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
            <span className="text-4xl">🔖</span>
            <h3 className="text-lg font-bold text-slate-800 mt-3">No saved jobs yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Jobs you save while browsing will appear here.
            </p>
            <Link
              href="/jobs-list"
              className="bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition inline-block"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => {
              const jobId = job._id || job.id;
              return (
                <div
                  key={jobId}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {job.companyName || job.company || "Featured Employer"} •{" "}
                      {job.location || "Remote"} ({job.jobType || job.type || "Full-time"})
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Link
                      href={`/jobseeker/apply/${jobId}`}
                      className="bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                    >
                      Apply Now
                    </Link>
                    <button
                      onClick={() => handleRemove(jobId)}
                      className="text-red-500 font-bold text-xs hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}