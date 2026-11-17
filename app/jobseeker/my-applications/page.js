"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Briefcase, MapPin, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

function MyApplicationsContent() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyApplications() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to view your applications.");
          return;
        }

        const res = await fetch("http://localhost:5000/api/applications", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const appList = data.applications || data || [];
          setApplications(Array.isArray(appList) ? appList : []);
        } else {
          toast.error("Failed to load your applications.");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("An error occurred while fetching applications.");
      } finally {
        setLoading(false);
      }
    }

    fetchMyApplications();
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Shortlisted":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shortlisted</span>
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-6">
        {/* Page Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Job Applications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Track your submission history and real-time review status updates from employers.
            </p>
          </div>
          <Link
            href="/jobs-list"
            className="inline-flex items-center space-x-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm"
          >
            <span>Browse More Jobs</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Applications List Section */}
        {loading ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200/80 text-center text-slate-500 text-sm shadow-xs">
            Loading your applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No applications found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven&apos;t submitted any job applications yet. Start exploring open positions and apply with a single click.
              </p>
            </div>
            <div>
              <Link
                href="/jobs-list"
                className="inline-block bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow"
              >
                Find Jobs Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const job = app.job || {};
              const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A";

              return (
                <div
                  key={app._id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {job.title || "Position Title Unavailable"}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 flex items-center space-x-2">
                        <span>{job.companyName || job.company || "Company Name"}</span>
                        <span>•</span>
                        <span className="flex items-center text-slate-500">
                          <MapPin className="w-3.5 h-3.5 inline mr-0.5" />
                          {job.location || "Remote"}
                        </span>
                      </p>
                    </div>

                    <div>{renderStatusBadge(app.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div>
                      <strong className="text-slate-800">Cover Letter:</strong>
                      <p className="text-slate-500 mt-0.5 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {app.coverLetter || "No cover letter provided."}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between space-y-2">
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Applied on {appliedDate}</span>
                      </div>
                      {app.resumeUrl && (
                        <div>
                          <a
                            href={app.resumeUrl.startsWith("http") ? app.resumeUrl : `http://localhost:5000${app.resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#06b6d4] hover:underline font-semibold inline-flex items-center space-x-1 text-xs"
                          >
                            <span>View Submitted Resume/Document</span>
                          </a>
                        </div>
                      )}
                    </div>
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

export default function MyApplicationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center text-slate-500 text-sm">Loading applications...</div>}>
      <MyApplicationsContent />
    </Suspense>
  );
}