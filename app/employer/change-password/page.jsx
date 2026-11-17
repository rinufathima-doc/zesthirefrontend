"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// Use 127.0.0.1 to avoid Windows localhost IPv6 connection bugs
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.job || state.auth || {});

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safely extract employer ID from Redux user state or localStorage fallback
  const [employerId, setEmployerId] = useState("");

  useEffect(() => {
    const idFromUser = user?.employerId || user?.id || user?._id;
    if (idFromUser) {
      setEmployerId(idFromUser);
    } else if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("userId");
      if (storedId) setEmployerId(storedId);
    }
  }, [user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
            Change Password
          </h2>
          <p className="text-xs text-slate-500 text-center mt-1">
            Ensure your account is using a secure password.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f]"
            />
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold py-3 px-4 rounded-xl transition shadow-md text-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
            <Link
              href={employerId ? `/company/${employerId}` : "/employer/dashboard"}
              className="px-5 py-3 border border-slate-300 hover:bg-slate-100 rounded-xl font-bold text-sm text-slate-700 transition text-center flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}