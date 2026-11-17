"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function JobApplyContent() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Resume submission mode: "file" or "link"
  const [resumeMode, setResumeMode] = useState("file");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    resumeUrl: "",
    coverLetter: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

  // Clean up object URL memory leak on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  // Fetch specific job details based on URL ID
  useEffect(() => {
    async function fetchJobDetails() {
      if (!jobId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        } else {
          toast.error("Failed to load job details.");
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobDetails();
  }, [jobId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB.");
        e.target.value = null;
        setResumeFile(null);
        setFilePreviewUrl(null);
        return;
      }
      setResumeFile(file);
      // Generate blob preview URL
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
    }
  };

  const removeSelectedFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setResumeFile(null);
    setFilePreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      let response;

      if (resumeMode === "file" && resumeFile) {
        // Submit using Multipart FormData (File Upload)
        const payload = new FormData();
        payload.append("jobId", jobId);
        payload.append("fullName", formData.fullName);
        payload.append("email", formData.email);
        payload.append("phone", formData.phone);
        payload.append("coverLetter", formData.coverLetter);
        payload.append("resume", resumeFile);

        response = await fetch(`${API_URL}/api/applications`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        });
      } else {
        // Submit as JSON Payload (URL Link)
        response = await fetch(`${API_URL}/api/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jobId,
            ...formData,
          }),
        });
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Non-JSON Server response:", errorText);
        toast.error(`Server route error (${response.status}). Check backend.`);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Application submitted successfully!");
        router.push("/jobseeker/my-applications");
      } else {
        toast.error(data.message || "Failed to submit application.");
      }
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Loading application form...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-xs font-bold text-[#8cc63f] hover:underline flex items-center gap-1 cursor-pointer"
      >
        &larr; Back to Search
      </button>

      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
        <h1 className="text-2xl font-black text-slate-900">
          Apply for {job?.title || "Position"}
        </h1>
        <p className="text-xs font-semibold text-slate-600">
          {job?.companyName || job?.company || "Featured Employer"} &bull; 📍 {job?.location || "Remote"}
        </p>
      </div>

      {/* Application Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
      >
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Candidate Name"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#8cc63f]"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#8cc63f]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#8cc63f]"
            />
          </div>
        </div>

        {/* Dynamic Resume / CV Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Resume / CV
            </label>
            {/* Toggle Mode Button */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
              <button
                type="button"
                onClick={() => setResumeMode("file")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  resumeMode === "file"
                    ? "bg-[#8cc63f] text-slate-950 font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setResumeMode("link")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  resumeMode === "link"
                    ? "bg-[#8cc63f] text-slate-950 font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                Provide Link
              </button>
            </div>
          </div>

          {resumeMode === "file" ? (
            <div className="space-y-3">
              {!resumeFile ? (
                /* Upload Box */
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-5 bg-slate-50 text-center hover:border-[#8cc63f] transition">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    required={resumeMode === "file"}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <span className="text-2xl">📄</span>
                    <p className="text-xs font-semibold text-slate-700">
                      Click or drag to upload your Resume
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>
                </div>
              ) : (
                /* Uploaded File Card + Live Preview Frame */
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <span className="text-2xl">📝</span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {resumeFile.type || "Document"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {filePreviewUrl && (
                        <a
                          href={filePreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-bold text-[#8cc63f] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                        >
                          Open Preview ↗
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="px-2.5 py-1 text-[11px] font-bold text-red-500 bg-white border border-slate-200 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Inline PDF Preview Frame */}
                  {filePreviewUrl && resumeFile.type === "application/pdf" && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                      <iframe
                        src={filePreviewUrl}
                        title="Resume Preview"
                        className="w-full h-64 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Link URL Input */
            <input
              type="url"
              name="resumeUrl"
              required={resumeMode === "link"}
              value={formData.resumeUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/... or LinkedIn / Portfolio URL"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#8cc63f]"
            />
          )}
        </div>

        {/* Cover Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Cover Note / Message to Employer
          </label>
          <textarea
            name="coverLetter"
            rows={4}
            value={formData.coverLetter}
            onChange={handleChange}
            placeholder="Write a short note highlighting your experience..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#8cc63f]"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-xs py-3.5 rounded-xl transition cursor-pointer text-center disabled:opacity-50 shadow-xs"
          >
            {submitting ? "Submitting Application..." : "Submit Application"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function JobApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
          Loading application page...
        </div>
      }
    >
      <JobApplyContent />
    </Suspense>
  );
}