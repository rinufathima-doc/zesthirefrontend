"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    headline: "",
    phone: "",
    location: "",
    bio: "",
    skills: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Profile updated successfully!");
        router.push("/jobseeker/profile");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      
        <div className="max-w-7xl mx-auto text-center space-y-3 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Edit Profile
          </h1>
          <div className="text-sm text-slate-300 flex items-center justify-center space-x-2">
            <Link href="/jobseeker/dashboard" className="hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8cc63f] font-medium">Edit Profile</span>
          </div>
        </div>
      

      {/* Main Content Section */}
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Headline</label>
              <input type="text" name="headline" value={formData.headline} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Bio</label>
              <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm"></textarea>
            </div>
            <button type="submit" className="w-full bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold py-3 rounded-xl transition text-sm cursor-pointer">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}