"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function MyResume() {
  const [file, setFile] = useState(null);
  const [existingResumeUrl, setExistingResumeUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch current profile & resume URL on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/jobseeker/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.user && data.user.resumeUrl) {
          setExistingResumeUrl(data.user.resumeUrl);
        }
      } catch (err) {
        console.error("Failed to fetch resume info:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/jobseeker/resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Resume upload failed");

      setExistingResumeUrl(result.resumeUrl);
      toast.success("Resume uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload resume.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-28">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">My Resume</h1>
          <p className="text-slate-500 text-sm mb-6">
            Upload or view your latest CV in PDF format to apply for jobs directly.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-[#8cc63f] transition bg-slate-50 flex flex-col items-center justify-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#8cc63f] file:text-slate-950 file:font-bold hover:file:bg-[#7cb342] cursor-pointer"
              />
              {file && (
                <span className="text-xs text-slate-600 font-medium mt-3">
                  Selected: {file.name}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition text-sm cursor-pointer disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </button>
          </form>
        </div>

        {/* ================= VIEW EXISTING RESUME SECTION ================= */}
        {existingResumeUrl && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Your Saved Resume</h2>
              <a
                href={`http://localhost:5000${existingResumeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-[#8cc63f] text-slate-950 font-bold px-4 py-2 rounded-xl hover:bg-[#7cb342] transition"
              >
                Open in Fullscreen
              </a>
            </div>

            <div className="w-full h-[500px] border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
              <iframe
                src={`http://localhost:5000${existingResumeUrl}`}
                title="Resume Preview"
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}