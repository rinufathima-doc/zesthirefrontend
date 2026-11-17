"use client";

import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PublicCandidateProfile() {
  const params = useParams();
  const { id } = params; // Candidate ID from URL route
  
  // Access login status from your jobSlice state
  const { user } = useSelector((state) => state.job);

  // Protect route: restrict view if user is not logged in
  if (!user?.isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            You must be logged into your job portal account to view candidate profiles.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition"
          >
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  // Simulated candidate data fetched based on the route ID
  const candidate = {
    fullName: "Alex Johnson",
    headline: "Full-Stack MERN Developer",
    bio: "Passionate full-stack developer specializing in Next.js, React, Node.js, and modern Tailwind CSS architectures with a strong focus on clean code and performance.",
    skills: ["React", "Next.js", "Node.js", "MongoDB", "Tailwind CSS", "Redux"],
    resumeUrl: "#",
    email: "alex.j@example.com",
    phone: "+91 9876543210",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 space-y-6">
        {/* Header / Profile Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {candidate.fullName}
            </h1>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
              {candidate.headline}
            </p>
          </div>
          {candidate.resumeUrl && (
            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition"
            >
              Download Resume
            </a>
          )}
        </div>

        {/* Contact Details (Visible to Logged-in Users) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="block text-slate-400 text-xs">Email Address</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {candidate.email}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 text-xs">Phone Number</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {candidate.phone}
            </span>
          </div>
        </div>

        {/* Professional Bio */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            About
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {candidate.bio}
          </p>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Skills & Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}