"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Calendar, Clock, Video, X, Send } from "lucide-react";

// SCHEDULE INTERVIEW MODAL COMPONENT
function ScheduleInterviewModal({ candidate, job, onClose }) {
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime) {
      toast.error("Please select a date and time.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/interviews/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          candidateEmail: candidate?.applicant?.email || candidate?.email,
          candidateName: candidate?.applicant?.name || candidate?.name || "Candidate",
          jobTitle: job?.title || candidate?.job?.title || "Open Position",
          companyName: candidate?.companyName || "ZestHire Partner Company",
          interviewDate,
          interviewTime,
          meetingLink,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Interview scheduled & email sent to candidate!");
        onClose();
      } else {
        toast.error(data.message || "Failed to schedule interview.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while scheduling interview.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Schedule Interview</h3>
            <p className="text-xs text-slate-500">
              Candidate: {candidate?.applicant?.email || candidate?.email}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSchedule} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8cc63f]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
              <input
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8cc63f]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link / Location</label>
            <input
              type="text"
              placeholder="e.g. Google Meet / Zoom link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8cc63f]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instructions / Notes</label>
            <textarea
              rows={3}
              placeholder="Add interview instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8cc63f] resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#8cc63f] hover:bg-[#7ab232] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Sending..." : "Send Invitation"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  // State for Interview Modal
  const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");

      const endpoint = jobId
        ? `http://localhost:5000/api/jobs/employer/incoming-applications?jobId=${jobId}`
        : "http://localhost:5000/api/jobs/employer/incoming-applications";

      const res = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      } else {
        toast.error(data.message || "Failed to load incoming applications.");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Network error while loading applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/applications/${appId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(`Application marked as ${newStatus}`);
        setApplications((prev) =>
          prev.map((app) =>
            app._id === appId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        toast.error(data.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Network error updating application status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "All") return true;
    return app.status === activeTab;
  });

  const counts = {
    All: applications.length,
    Pending: applications.filter((a) => a.status === "Pending" || !a.status).length,
    Shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    Rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading incoming applications...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Incoming Applications
          </h1>
          <p className="text-xs text-slate-500">
            {jobId
              ? "Viewing applicants for this specific job position."
              : "Review candidates who applied to your posted job listings."}
          </p>
        </div>
        {jobId && (
          <a
            href="/employer/manage-jobs"
            className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition self-start sm:self-auto"
          >
            ← Back to All Jobs
          </a>
        )}
      </div>

      {/* TABS BAR */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {["All", "Pending", "Shortlisted", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === tab
                ? "border-[#8cc63f] text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>{tab}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab
                  ? "bg-[#8cc63f]/20 text-slate-900"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts[tab] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* APPLICATIONS LIST */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <p className="text-2xl">📭</p>
          <p className="text-sm font-bold text-slate-800">
            No {activeTab.toLowerCase()} applications found.
          </p>
          <p className="text-xs text-slate-500">
            Try switching tabs or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApplications.map((app) => {
            const rawResumeUrl = app.resumeUrl || app.applicant?.resumeUrl;
            const resumeLink = rawResumeUrl
              ? rawResumeUrl.startsWith("http")
                ? rawResumeUrl
                : `http://localhost:5000${rawResumeUrl.startsWith("/") ? "" : "/"}${rawResumeUrl}`
              : null;

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">
                      {app.job?.title || "Position"}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Applicant Email: {app.applicant?.email || app.email || "Candidate"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                        app.status === "Shortlisted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : app.status === "Rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {app.status || "Pending"}
                    </span>
                    {resumeLink ? (
                      <a
                        href={resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-sm"
                      >
                        View Resume ↗
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl cursor-not-allowed">
                        No Resume
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-bold text-slate-700">
                    Cover Letter / Message:
                  </p>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {app.coverLetter || "No cover letter provided."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3">
                  <p className="text-[11px] text-slate-400">
                    Applied on: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* SCHEDULE INTERVIEW BUTTON */}
                    <button
                      onClick={() => setSelectedAppForInterview(app)}
                      className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Interview</span>
                    </button>

                    <button
                      disabled={updatingId === app._id}
                      onClick={() => handleStatusChange(app._id, "Shortlisted")}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
                    >
                      Shortlist
                    </button>
                    <button
                      disabled={updatingId === app._id}
                      onClick={() => handleStatusChange(app._id, "Rejected")}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER MODAL IF ACTIVE */}
      {selectedAppForInterview && (
        <ScheduleInterviewModal
          candidate={selectedAppForInterview}
          job={selectedAppForInterview.job}
          onClose={() => setSelectedAppForInterview(null)}
        />
      )}
    </div>
  );
}

export default function EmployerApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading application page...
        </div>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}