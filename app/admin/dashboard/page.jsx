"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.job);

  const [stats, setStats] = useState({ totalUsers: 0, totalJobSeekers: 0, totalEmployers: 0, totalJobs: 0 });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "users" | "jobs"
  const [loading, setLoading] = useState(true);

  // Verify admin access on load
  useEffect(() => {
    if (user && user.role?.toLowerCase() !== "admin") {
      toast.error("Access denied. Admins only.");
      router.push("/");
    }
  }, [user, router]);

  // Fetch admin data
  useEffect(() => {
    async function fetchAdminData() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, usersRes, jobsRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/stats", { headers }),
          fetch("http://localhost:5000/api/admin/users", { headers }),
          fetch("http://localhost:5000/api/admin/jobs", { headers }),
        ]);

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        const jobsData = await jobsRes.json();

        if (statsRes.ok) setStats(statsData.stats);
        if (usersRes.ok) setUsers(usersData.users);
        if (jobsRes.ok) setJobs(jobsData.jobs);
      } catch (err) {
        console.error("Failed to load admin data:", err);
        toast.error("Error loading admin dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("User deleted successfully");
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to remove this job listing?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Job removed successfully");
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove job");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-medium">Loading Admin Panel...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* ================= HEADER ================= */}
      <div className="bg-slate-900 text-white py-12 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#8cc63f] font-bold">
              Admin Control Center
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">
              ZESTHIRE Administration
            </h1>
          </div>
          <div className="flex space-x-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "overview" ? "bg-[#8cc63f] text-slate-950" : "text-slate-300 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "users" ? "bg-[#8cc63f] text-slate-950" : "text-slate-300 hover:text-white"
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "jobs" ? "bg-[#8cc63f] text-slate-950" : "text-slate-300 hover:text-white"
              }`}
            >
              Jobs ({jobs.length})
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="max-w-6xl mx-auto px-6 mt-10">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Jobseekers</span>
                <p className="text-3xl font-extrabold text-[#8cc63f] mt-2">{stats.totalJobSeekers}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Employers</span>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">{stats.totalEmployers}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Jobs Posted</span>
                <p className="text-3xl font-extrabold text-purple-600 mt-2">{stats.totalJobs}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
                    <th className="py-4 px-6">Name / Company</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900">{u.name || u.companyName}</td>
                      <td className="py-4 px-6 text-slate-600">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'employer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-xs font-bold text-red-600 hover:text-red-800 transition cursor-pointer"
                          >
                            Delete User
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Job Moderation</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
                    <th className="py-4 px-6">Job Title</th>
                    <th className="py-4 px-6">Company</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900">{job.title}</td>
                      <td className="py-4 px-6 text-slate-600">{job.companyName}</td>
                      <td className="py-4 px-6 text-slate-600">{job.location}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="text-xs font-bold text-red-600 hover:text-red-800 transition cursor-pointer"
                        >
                          Remove Job
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}