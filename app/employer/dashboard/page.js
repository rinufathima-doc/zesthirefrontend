"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { z } from "zod";

// Use 127.0.0.1 to prevent Windows localhost IPv6 connection bugs
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// Zod schema for validating MongoDB ObjectId format before job deletion
const jobIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID format");

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Initialize state immediately from cached localStorage to prevent header flicker on refresh
  const [companyName, setCompanyName] = useState(() => {
    if (typeof window !== "undefined") {
      const cachedUser = localStorage.getItem("user") || localStorage.getItem("userInfo");
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          if (parsed.companyName || parsed.name) {
            return parsed.companyName || parsed.name;
          }
        } catch (e) {}
      }
    }
    return "Employer Dashboard";
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState(null);

  // 1. Instant Route Protection Guard on Mount
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("employertoken");
    let userRole = localStorage.getItem("role");

    if (!userRole) {
      const cachedUser = localStorage.getItem("user") || localStorage.getItem("userInfo");
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          userRole = parsed.role || parsed.userType;
        } catch (e) {}
      }
    }

    const normalizedRole = (userRole || "").toLowerCase().trim();

    // Check if token is missing
    if (!token || token === "null" || token === "undefined") {
      toast.error("Please log in as an employer to continue.");
      router.replace("/login");
      return;
    }

    // Block jobseekers trying to access employer dashboard
    if (normalizedRole === "jobseeker" || normalizedRole === "job_seeker") {
      toast.error("Unauthorized access.");
      router.replace("/jobseeker/dashboard");
      return;
    }

    // If no valid role found
    if (!normalizedRole) {
      toast.error("Session invalid. Please log in again.");
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  // 2. Fetch Dashboard Data only when authorized
  useEffect(() => {
    if (!isAuthorized) return;

    async function fetchEmployerData() {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("employertoken");
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        let resolvedCompanyName = companyName;
        let employerId = null;

        const cachedUser = localStorage.getItem("user") || localStorage.getItem("userInfo");
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            employerId = parsed._id || parsed.id || parsed.employerId;
          } catch (e) {}
        }

        if (employerId) {
          try {
            const profileRes = await fetch(`${API_URL}/api/jobs/company/${employerId}`, { headers });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              const name = profileData.user?.companyName || profileData.user?.name || profileData.companyName;
              if (name) resolvedCompanyName = name;
            }
          } catch (profileErr) {
            console.error("Failed to fetch employer profile:", profileErr);
          }
        }

        const jobsRes = await fetch(`${API_URL}/api/jobs/employer/jobs`, { headers });
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (Array.isArray(jobsData)) {
            setJobs(jobsData);
            if ((resolvedCompanyName === "Employer Dashboard" || !resolvedCompanyName) && jobsData.length > 0) {
              const matchedJobCompany = jobsData.find((j) => j.companyName)?.companyName;
              if (matchedJobCompany) resolvedCompanyName = matchedJobCompany;
            }
          }
        }

        setCompanyName(resolvedCompanyName);
      } catch (err) {
        console.error("Failed to fetch employer dashboard data:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployerData();
  }, [isAuthorized]);

  const handleDeleteClick = (id) => {
    const validationResult = jobIdSchema.safeParse(id);
    if (!validationResult.success) {
      toast.error("Invalid job ID format.");
      return;
    }
    setJobToDelete(id);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("employertoken");
      const res = await fetch(`${API_URL}/api/jobs/${jobToDelete}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      if (res.ok) {
        toast.success("Job deleted successfully");
        setJobs((prev) => prev.filter((j) => (j._id || j.id) !== jobToDelete));
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete job");
      }
    } catch (err) {
      toast.error(err.message || "Error deleting job");
    } finally {
      setJobToDelete(null);
    }
  };

  const totalApplications = jobs.reduce((acc, job) => acc + (job.applicantCount || 0), 0);

  // Show loading spinner while route guard verifies access
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-6 h-6 border-2 border-[#8cc63f] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Verifying employer access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-slate-800 relative">
      {/* ================= HERO HEADER ================= */}
      <div
        className="relative text-white py-20 px-4 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.88)), url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1600")',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8cc63f] font-extrabold mb-1">
              Employer Portal
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {companyName}
            </h1>
          </div>
        </div>
      </div>

      {/* ================= METRICS STATS ================= */}
      <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-20 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Posted Jobs
            </span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{jobs.length}</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Listings
            </span>
            <p className="text-3xl font-extrabold text-[#8cc63f] mt-2">{jobs.length}</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Applications Received
            </span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalApplications}</p>
          </div>
        </div>
      </section>

      {/* ================= JOBS TABLE ================= */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Posted Jobs</h2>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-500 font-medium">
              Loading your postings...
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-600 font-medium mb-4">You have no active job postings.</p>
              <Link
                href="/employer/post-job"
                className="inline-block bg-[#8cc63f] text-slate-950 font-bold py-2.5 px-5 rounded-xl text-sm hover:bg-[#7cb342] transition shadow-sm"
              >
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
                    <th className="py-4 px-6">Job Title</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Applicants</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {jobs.map((job) => {
                    const jobId = job._id || job.id;
                    return (
                      <tr key={jobId} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6 font-semibold text-slate-900">{job.title}</td>
                        <td className="py-4 px-6">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs font-semibold">
                            {job.jobType || "Full Time"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600">{job.location}</td>
                        <td className="py-4 px-6 font-semibold text-[#8cc63f]">
                          {job.applicantCount || 0} candidates
                        </td>
                        <td className="py-4 px-6 text-right space-x-3">
                          <button
                            onClick={() => router.push(`/employer/applications?jobId=${jobId}`)}
                            className="text-xs font-bold text-slate-700 hover:text-[#8cc63f] transition cursor-pointer"
                          >
                            Applicants
                          </button>
                          <button
                            onClick={() => router.push(`/employer/post-job?id=${jobId}`)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(jobId)}
                            className="text-xs font-bold text-red-600 hover:text-red-800 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ================= CUSTOM DELETION MODAL BOX ================= */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              !
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Job Posting?</h3>
            <p className="text-xs text-slate-600 mb-6">
              This action is permanent and will remove the job listing along with all associated candidate tracking data.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setJobToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteJob}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}