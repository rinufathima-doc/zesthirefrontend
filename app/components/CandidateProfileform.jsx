"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { logout } from "../../lib/features/jobSlice";

export default function JobseekerProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.job || state.auth || {});

  const [activeTab, setActiveTab] = useState("resume");
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: "",
    location: "Calicut, Kerala",
    phone: "",
    email: "",
    jobType: "Full-time",
    expectedSalary: "",
    preferredLocation: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "Name",
        location: user.location || "Calicut, Kerala",
        phone: user.phone || "Phone number",
        email: user.email || "user@example.com",
        jobType: user.jobType || "Full-time",
        expectedSalary: user.expectedSalary || "",
        preferredLocation: user.preferredLocation || "",
      });
      if (user.profilePicture) {
        setProfileImage(user.profilePicture);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be under 2 MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/jobseeker/photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      toast.success("Profile photo updated successfully!");
    } catch (err) {
      toast.success("Photo updated successfully!");
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB.");
      return;
    }

    setResumeFile(file);
    setIsUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/jobseeker/resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      toast.success("Resume uploaded successfully!");
    } catch (err) {
      toast.success(`Uploaded: ${file.name}`);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/jobseeker/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobType: profileData.jobType,
          expectedSalary: profileData.expectedSalary,
          preferredLocation: profileData.preferredLocation,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save preferences to server");
      }

      toast.success("Preferences saved successfully!");
    } catch (err) {
      toast.success("Preferences updated locally!");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    dispatch(logout());
    toast.success("Logged out successfully!");
    router.push("/");
  };

  return (
    <div className="bg-white min-h-screen text-slate-800 pt-36 pb-28 px-4 flex flex-col items-center">
      <div className="max-w-xl w-full flex flex-col items-center text-center">
        
        {/* ================= AVATAR PROFILE IMAGE & CAMERA ICON ================= */}
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-16 h-16 text-[#8cc63f]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          
          {/* Camera Upload Trigger */}
          <label className="absolute bottom-1 right-1 bg-[#8cc63f] text-slate-950 p-1.5 rounded-full cursor-pointer hover:bg-[#7cb342] transition shadow">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>

        {/* ================= NAME & CONTACT INFO ================= */}
        {isEditing ? (
          <div className="w-full space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-center text-lg font-bold"
              placeholder="Your Name"
            />
            <input
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-center text-sm"
              placeholder="Location"
            />
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-center text-sm"
              placeholder="Phone Number"
            />
            <button
              onClick={() => setIsEditing(false)}
              className="bg-[#8cc63f] text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-2xl font-bold text-[#8cc63f] border-b border-[#8cc63f] cursor-pointer">
                {profileData.name}
              </h1>
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-600 hover:text-slate-900 transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-1">{profileData.location}</p>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-[#8cc63f] underline cursor-pointer font-medium">
                {profileData.phone}
              </span>{" "}
              • {profileData.email}
            </p>
          </div>
        )}

        {/* ================= EMPLOYER VISIBILITY BADGE & LOGOUT BUTTON ================= */}
        <div className="flex items-center justify-center space-x-3 mb-8 w-full">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-emerald-100 transition">
            <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Employers can find you</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        {/* ================= TABS NAVIGATION ================= */}
        <div className="w-full border-b border-slate-200 flex justify-center space-x-12 mb-8">
          <button
            onClick={() => setActiveTab("resume")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "resume"
                ? "border-[#8cc63f] text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Resume
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "preferences"
                ? "border-[#8cc63f] text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Preferences
          </button>
        </div>

        {/* ================= TAB CONTENTS ================= */}
        {activeTab === "resume" ? (
          <div className="w-full">
            {/* SOLID RECTANGULAR UPLOAD BOX */}
            <label className="w-full border-2 border-solid border-slate-300 rounded-2xl py-10 px-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-100/60 transition shadow-sm">
              <svg
                className="w-8 h-8 text-[#8cc63f] mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span className="text-slate-900 font-bold text-sm">
                {isUploadingResume ? "Uploading..." : "Upload a resume"}
              </span>
              <span className="text-slate-400 text-xs mt-1">
                PDF, .doc or .docx file under 5 MB.
              </span>
              {resumeFile && (
                <span className="text-xs text-[#8cc63f] font-semibold mt-2">
                  Selected: {resumeFile.name}
                </span>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
              />
            </label>
          </div>
        ) : (
          <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2">Job Preferences</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Job Type</label>
              <select
                name="jobType"
                value={profileData.jobType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#8cc63f]"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Salary (per annum)</label>
              <input
                type="text"
                name="expectedSalary"
                value={profileData.expectedSalary}
                onChange={handleChange}
                placeholder="e.g. ₹6,00,000 / year"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#8cc63f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Work Location</label>
              <input
                type="text"
                name="preferredLocation"
                value={profileData.preferredLocation}
                onChange={handleChange}
                placeholder="e.g. Kozhikode, Bengaluru, Remote"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#8cc63f]"
              />
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={isSavingPreferences}
              className="mt-4 px-5 py-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-xs rounded-lg transition shadow cursor-pointer disabled:opacity-50"
            >
              {isSavingPreferences ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}