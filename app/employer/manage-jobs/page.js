"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected state for modals
  const [viewJob, setViewJob] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [deleteJobId, setDeleteJobId] = useState(null);

  // Fetch Employer Jobs from Backend
  const fetchEmployerJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/jobs/employer/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        toast.error("Failed to fetch your job listings.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  // Filter Jobs by Search Query & Status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || (job.status || "Active").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate Stat Counts
  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => (j.status || "Active") === "Active").length,
    closed: jobs.filter((j) => j.status === "Closed").length,
    totalApplicants: jobs.reduce((acc, curr) => acc + (curr.applicantCount || 0), 0),
  };

  // Toggle Status (Close / Reopen)
  const handleToggleStatus = async (job) => {
    const currentStatus = job.status || "Active";
    const newStatus = currentStatus === "Active" ? "Closed" : "Active";
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/jobs/${job._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Job marked as ${newStatus}`);
        fetchEmployerJobs();
      } else {
        toast.error("Failed to update job status.");
      }
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  // Delete Job
  const handleDeleteJob = async () => {
    if (!deleteJobId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/jobs/${deleteJobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Job deleted successfully.");
        setDeleteJobId(null);
        fetchEmployerJobs();
      } else {
        toast.error("Failed to delete job.");
      }
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  // Save Edit Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/jobs/${editJob._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editJob),
      });

      if (res.ok) {
        toast.success("Job updated successfully!");
        setEditJob(null);
        fetchEmployerJobs();
      } else {
        toast.error("Failed to update job details.");
      }
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Manage Jobs</h1>
            <p className="text-slate-500 text-sm mt-1">
              View, edit, track applicants, or update your active vacancies.
            </p>
          </div>
          <Link
            href="/employer/post-job"
            className="px-5 py-2.5 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold rounded-xl text-sm transition shadow-xs flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Jobs</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Vacancies</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Closed Vacancies</p>
            <p className="text-2xl font-bold text-slate-500 mt-1">{stats.closed}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applicants</p>
            <p className="text-2xl font-bold text-[#8cc63f] mt-1">{stats.totalApplicants}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by job title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8cc63f]"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {["All", "Active", "Closed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  statusFilter === status
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">
                      Loading posted jobs...
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">
                      No matching job postings found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const status = job.status || "Active";
                    return (
                      <tr key={job._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">{job.title}</td>
                        <td className="px-6 py-4">{job.location}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                            {job.jobType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#8cc63f]">
                          <Link 
                            href="/employer/applications" 
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs transition font-bold"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{job.applicantCount || 0} Candidates</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewJob(job)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                              title="View Job Details"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => setEditJob(job)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                              title="Edit Job"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(job)}
                              className={`px-2.5 py-1 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-1 ${
                                status === "Active"
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-700"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              }`}
                              title={status === "Active" ? "Close Job" : "Reopen Job"}
                            >
                              {status === "Active" ? (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span>Close</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                  </svg>
                                  <span>Reopen</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteJobId(job._id)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                              title="Delete Job"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ================= VIEW JOB MODAL ================= */}
      {viewJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{viewJob.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{viewJob.location} • {viewJob.jobType}</p>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-4">
              <p><strong>Salary Range:</strong> ₹{viewJob.salaryMin?.toLocaleString() || 0} - ₹{viewJob.salaryMax?.toLocaleString() || 0}</p>
              <div>
                <p className="font-bold text-xs text-slate-700 mb-1">Description:</p>
                <p className="bg-slate-50 p-3 rounded-xl text-xs leading-relaxed text-slate-600">{viewJob.description}</p>
              </div>
              <div>
                <p className="font-bold text-xs text-slate-700 mb-1">Qualifications:</p>
                <p className="bg-slate-50 p-3 rounded-xl text-xs leading-relaxed text-slate-600">{viewJob.qualifications || viewJob.requirements || "Not specified"}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewJob(null)}
                className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-xl text-xs cursor-pointer hover:bg-slate-900"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT JOB MODAL ================= */}
      {editJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">Edit Job Posting</h2>
            
            <div>
              <label className="text-xs font-bold text-slate-600">Job Title</label>
              <input
                type="text"
                value={editJob.title || ""}
                onChange={(e) => setEditJob({ ...editJob, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm mt-1 focus:outline-none focus:border-[#8cc63f]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Location</label>
                <input
                  type="text"
                  value={editJob.location || ""}
                  onChange={(e) => setEditJob({ ...editJob, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm mt-1 focus:outline-none focus:border-[#8cc63f]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Job Type</label>
                <select
                  value={editJob.jobType || "Full-time"}
                  onChange={(e) => setEditJob({ ...editJob, jobType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm mt-1 bg-white focus:outline-none focus:border-[#8cc63f]"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Remote</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Description</label>
              <textarea
                rows="3"
                value={editJob.description || ""}
                onChange={(e) => setEditJob({ ...editJob, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm mt-1 focus:outline-none focus:border-[#8cc63f]"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditJob(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteJobId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Delete Job Posting?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to delete this vacancy? This action cannot be undone.
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDeleteJobId(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}