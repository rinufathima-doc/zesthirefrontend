"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { logout } from "../../lib/features/jobSlice";

// ================= ZOD SCHEMA FOR PROFILE VALIDATION =================
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  location: z.string().min(2, "Location is required."),
  phone: z.string().min(10, "Please enter a valid phone number."),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function JobseekerProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { user } = useSelector((state) => state.job || state.auth || {});

  const [activeTab, setActiveTab] = useState("resume");
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            name: parsed.name || parsed.userName || "",
            location: parsed.location || "Calicut, Kerala",
            phone: parsed.phone || "",
            email: parsed.email || "",
          };
        } catch (e) {}
      }
    }
    return {
      name: "",
      location: "Calicut, Kerala",
      phone: "",
      email: "",
    };
  });

  const [profileImage, setProfileImage] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profileData.name,
      location: profileData.location,
      phone: profileData.phone,
    },
  });

  // Fetch latest profile data and resume from backend on mount
  useEffect(() => {
    const fetchProfileAndResume = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const cleanToken = token.replace(/^Bearer\s+/i, "");

        // 1. Fetch Profile Info
        const res = await fetch(`${API_URL}/api/jobseeker/profile`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        const data = await res.json();

        if (res.ok && data.user) {
          const updated = {
            name: data.user.name || data.user.fullName || "",
            location: data.user.location || "Calicut, Kerala",
            phone: data.user.phone || "",
            email: data.user.email || "",
          };
          setProfileData(updated);
          setValue("name", updated.name);
          setValue("location", updated.location);
          setValue("phone", updated.phone);

          if (data.user.profilePicture) {
            const photoPath = data.user.profilePicture;
            setProfileImage(photoPath.startsWith("http") ? photoPath : `${API_URL}${photoPath}`);
          }
        }

        // 2. Fetch Resume URL
        const resumeRes = await fetch(`${API_URL}/api/jobseeker/resume`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        const resumeData = await resumeRes.json();

        if (resumeRes.ok && resumeData.resumeUrl) {
          const fullResumeUrl = resumeData.resumeUrl.startsWith("http")
            ? resumeData.resumeUrl
            : `${API_URL}${resumeData.resumeUrl}`;
          setResumeUrl(fullResumeUrl);
        }
      } catch (err) {
        console.error("Failed to fetch profile/resume:", err);
      }
    };

    fetchProfileAndResume();
  }, [setValue]);

  // Sync with Redux / localStorage
  useEffect(() => {
    let activeUser = user;
    if (!activeUser && typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          activeUser = JSON.parse(stored);
        } catch (e) {}
      }
    }

    if (activeUser) {
      const updatedData = {
        name: activeUser.name || activeUser.userName || profileData.name,
        location: activeUser.location || profileData.location,
        phone: activeUser.phone || profileData.phone,
        email: activeUser.email || profileData.email,
      };

      setProfileData(updatedData);
      setValue("name", updatedData.name);
      setValue("location", updatedData.location);
      setValue("phone", updatedData.phone);

      if (activeUser.profilePicture) {
        setProfileImage(
          activeUser.profilePicture.startsWith("http")
            ? activeUser.profilePicture
            : `${API_URL}${activeUser.profilePicture}`
        );
      }
    }
  }, [user, setValue]);

  // ================= SAVE PROFILE HANDLER =================
  const onSubmitProfile = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const cleanToken = token ? token.replace(/^Bearer\s+/i, "") : "";

      const res = await fetch(`${API_URL}/api/jobseeker/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update profile");

      setProfileData((prev) => ({ ...prev, ...data }));
      
      if (typeof window !== "undefined") {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...currentUser, ...data }));
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err.message || "Could not save profile changes.");
    }
  };

  // ================= PHOTO UPLOAD HANDLER =================
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be under 2 MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("token");
      const cleanToken = token ? token.replace(/^Bearer\s+/i, "") : "";

      const res = await fetch(`${API_URL}/api/jobseeker/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cleanToken}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Photo upload failed");

      const fullImageUrl = result.profilePicture.startsWith("http")
        ? result.profilePicture
        : `${API_URL}${result.profilePicture}`;
        
      setProfileImage(fullImageUrl);
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error(err.message || "Failed to upload photo.");
    }
  };

  // ================= RESUME UPLOAD HANDLER =================
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB.");
      return;
    }

    setIsUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const token = localStorage.getItem("token");
      const cleanToken = token ? token.replace(/^Bearer\s+/i, "") : "";

      const res = await fetch(`${API_URL}/api/jobseeker/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cleanToken}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Resume upload failed");

      const fullResumeUrl = result.resumeUrl.startsWith("http")
        ? result.resumeUrl
        : `${API_URL}${result.resumeUrl}`;

      setResumeUrl(fullResumeUrl);
      toast.success("Resume uploaded successfully!");
    } catch (err) {
      console.error("Resume upload error:", err);
      toast.error(err.message || "Failed to upload resume.");
    } finally {
      setIsUploadingResume(false);
    }
  };

  // ================= LOGOUT HANDLER =================
  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; max-age=0;";
    document.cookie = "employertoken=; path=/; max-age=0;";
    document.cookie = "role=; path=/; max-age=0;";
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
          <form onSubmit={handleSubmit(onSubmitProfile)} className="w-full space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <input
                type="text"
                {...register("name")}
                className="w-full px-3 py-2 border rounded-lg text-center text-lg font-bold"
                placeholder="Your Name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <input
                type="text"
                {...register("location")}
                className="w-full px-3 py-2 border rounded-lg text-center text-sm"
                placeholder="Location"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <input
                type="text"
                {...register("phone")}
                className="w-full px-3 py-2 border rounded-lg text-center text-sm"
                placeholder="Phone Number"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <button
                type="submit"
                className="bg-[#8cc63f] text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-[#7cb342] transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-slate-200 text-slate-700 font-medium px-4 py-1.5 rounded-lg text-xs hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-2xl font-bold text-[#8cc63f] border-b border-[#8cc63f] cursor-pointer">
                {profileData.name || "User Name"}
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
                {profileData.phone || "Add phone number"}
              </span>{" "}
              - {profileData.email || "No email linked"}
            </p>
          </div>
        )}

        {/* ================= EMPLOYER VISIBILITY & LOGOUT ================= */}
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
          <div className="w-full space-y-4">
            {resumeUrl ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3 truncate">
                  <span className="text-2xl">📄</span>
                  <div className="text-left truncate">
                    <p className="font-semibold text-slate-800 text-sm truncate">Uploaded Resume</p>
                    <p className="text-xs text-emerald-600 font-medium">Active & Saved</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                  >
                    View
                  </a>
                  <label className="cursor-pointer px-3 py-1.5 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 rounded-xl text-xs font-bold transition shadow-xs">
                    <span>{isUploadingResume ? "Replacing..." : "Replace"}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                    />
                  </label>
                </div>
              </div>
            ) : (
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
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                />
              </label>
            )}
          </div>
        ) : (
          <div className="w-full text-slate-500 text-sm py-10">
            Preferences configuration options go here.
          </div>
        )}

      </div>
    </div>
  );
}