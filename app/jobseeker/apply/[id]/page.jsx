"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import JobseekerNavbar from "../components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function FindJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  // Selected job for the right-hand side preview panel
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // Fetch all jobs
        const jobsRes = await fetch(`${API_URL}/api/jobs`, { headers });
        const jobsData = jobsRes.ok ? await jobsRes.json() : [];

        // Fetch user's saved jobs to determine bookmark status
        let savedIds = [];
        if (token) {
          const savedRes = await fetch(`${API_URL}/api/jobs/saved`, { headers });
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            savedIds = Array.isArray(savedData)
              ? savedData.map((item) => item._id || item.id)
              : [];
          }
        }

        const jobList = Array.isArray(jobsData) ? jobsData : [];
        setJobs(jobList);
        if (jobList.length > 0) {
          setSelectedJob(jobList[0]); // Default select first job for preview
        }
        setSavedJobIds(savedIds);
      } catch (error) {
        console.error("Error fetching jobs list:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle Save / Unsave Job
  const toggleSaveJob = async (jobId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to save jobs.");
      return;
    }

    const isSaved = savedJobIds.includes(jobId);

    try {
      if (isSaved) {
        const res = await fetch(`${API_URL}/api/jobs/saved/${jobId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
        }
      } else {
        const res = await fetch(`${API_URL}/api/jobs/save/${jobId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setSavedJobIds((prev) => [...prev, jobId]);
        }
      }
    } catch (error) {
      console.error("Error toggling saved job:", error);
    }
  };

  // Filter jobs dynamically
  const filteredJobs = jobs.filter((job) => {
    const titleMatch = (job.title || "")
      .toLowerCase()
      .includes(searchTitle.toLowerCase());
    const locationMatch = (job.location || "")
      .toLowerCase()
      .includes(searchLocation.toLowerCase());
    const typeMatch =
      selectedType === "All" ||
      (job.jobType || job.type || "").toLowerCase() === selectedType.toLowerCase();

    return titleMatch && locationMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 pb-16">
      <JobseekerNavbar />

      {/* ================= DARK HERO HEADER WITH PILL SEARCH BAR ================= */}
      <div
        className="relative text-white pt-28 pb-16 px-6 bg-cover bg-center border-b border-slate-800"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15, 23, 42, 0.90), rgba(15, 23, 42, 0.90)), url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1600")',
        }}
      >
        <div className="max-w-7xl mx-auto text-center space-y-3 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Find Your Dream Job
          </h1>

          {/* Exact Pill-Shaped Search Bar */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center bg-white border border-slate-300 rounded-full shadow-xl p-2 w-full transition">
              
              {/* Keyword / Title Input */}
              <div className="flex items-center flex-1 w-full px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200">
                <span className="text-slate-400 mr-3 text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Location Input */}
              <div className="flex items-center flex-1 w-full px-4 py-2 my-1 md:my-0">
                <span className="text-slate-400 mr-3 text-lg">📍</span>
                <input
                  type="text"
                  placeholder="City, state, or 'Remote'"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Job Type Selector */}
              <div className="px-3 border-l border-slate-200 hidden lg:block">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer py-2"
                >
                  <option value="All">All Types</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Find Jobs Cyan Submit Button */}
              <button
                type="button"
                className="w-full md:w-auto bg-[#06b6d4] hover:bg-[#0891b2] text-white font-semibold px-8 py-3 rounded-full transition shadow text-sm tracking-wide cursor-pointer flex items-center justify-center"
              >
                Find jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SPLIT SCREEN JOB LIST & PREVIEW ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Jobs List Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-slate-900">
              Job Feed ({filteredJobs.length})
            </h2>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              Loading available positions...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-700">No matching jobs found.</p>
              <button
                onClick={() => {
                  setSearchTitle("");
                  setSearchLocation("");
                  setSelectedType("All");
                }}
                className="mt-3 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
              {filteredJobs.map((job) => {
                const jobId = job._id || job.id;
                const isSaved = savedJobIds.includes(jobId);
                const isSelected = selectedJob && (selectedJob._id === jobId || selectedJob.id === jobId);

                return (
                  <div
                    key={jobId}
                    onClick={() => setSelectedJob(job)}
                    className={`bg-white p-5 rounded-2xl border transition cursor-pointer shadow-sm ${
                      isSelected ? "border-[#06b6d4] ring-1 ring-[#06b6d4]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-cyan-50 text-[#06b6d4] font-semibold text-[10px] rounded-md mb-2">
                          Easily apply
                        </span>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                          {job.companyName || job.company || "Featured Employer"} • 4.7 ⭐
                        </p>
                      </div>
                      <button
                        onClick={(e) => toggleSaveJob(jobId, e)}
                        className={`text-lg transition p-1 rounded-lg ${
                          isSaved ? "text-yellow-500" : "text-slate-300 hover:text-slate-500"
                        }`}
                        title={isSaved ? "Saved" : "Save Job"}
                      >
                        {isSaved ? "🔖" : "📑"}
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                      📍 {job.location || "Remote"} • 💼 {job.jobType || job.type || "Full Time"}
                    </p>

                    <p className="text-slate-600 text-xs line-clamp-2">
                      {job.description || "No description provided."}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Detailed Job View Panel */}
        <div className="lg:col-span-7">
          {selectedJob ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-6">
              
              {/* Job Header */}
              <div className="space-y-2 border-b border-slate-100 pb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {selectedJob.title}
                </h2>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-semibold text-slate-800">
                    {selectedJob.companyName || selectedJob.company || "Featured Employer"}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">4.7 ⭐</span>
                </div>
                <p className="text-xs text-slate-500">📍 {selectedJob.location || "Remote"}</p>
                {selectedJob.salary && (
                  <p className="text-xs font-semibold text-slate-700 pt-1">
                    💰 {selectedJob.salary}
                  </p>
                )}
              </div>

              {/* Action Buttons Toolbar with Updated Apply Link Route */}
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6">
                <Link
                  href={`/jobseeker/apply/${selectedJob._id || selectedJob.id}`}
                  className="px-6 py-2.5 bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold text-xs rounded-xl transition shadow cursor-pointer text-center"
                >
                  Apply now
                </Link>
                
                <button
                  onClick={(e) => toggleSaveJob(selectedJob._id || selectedJob.id, e)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition cursor-pointer"
                  title="Save Job"
                >
                  🔖
                </button>
                
                <button className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition cursor-pointer" title="Not Interested">
                  👎
                </button>
                
                <button className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition cursor-pointer" title="Share">
                  📤
                </button>
              </div>

              {/* Job Full Description Section */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Job details</h3>
                
                <div className="space-y-3 text-xs text-slate-700">
                  {selectedJob.salary && (
                    <div className="flex items-center space-x-2">
                      <span>💵</span>
                      <span><strong>Pay:</strong> {selectedJob.salary}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span>⏰</span>
                    <span><strong>Job type:</strong> {selectedJob.jobType || selectedJob.type || "Full-time"}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span>📍</span>
                    <span><strong>Location:</strong> {selectedJob.location || "Remote"}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">Full Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {selectedJob.description || "No full description provided by employer."}
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
              Select a job from the list to view full details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}