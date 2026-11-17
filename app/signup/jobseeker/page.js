"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { jobseekerSignupSchema } from "../../lib/validations/auth";
import { setUser, setLoading, setError } from "../../lib/features/jobSlice";

// Use 127.0.0.1 to avoid Windows localhost IPv6 connection bugs
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function JobseekerSignupPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.job || state);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobseekerSignupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      title: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          title: data.title,
          password: data.password,
          role: "jobseeker",
        }),
      });

      const result = await res
        .json()
        .catch(() => ({ message: "Server connection failed" }));

      if (!res.ok) throw new Error(result.message || "Signup failed");

      const userToken = result.token;
      const userRole = result.user?.role || "jobseeker";

      if (userToken) {
        // --- LOCALSTORAGE PERSISTENCE ---
        localStorage.setItem("token", userToken);
        localStorage.setItem("role", userRole);
        const createdUser = result.user || result;
        localStorage.setItem("user", JSON.stringify(createdUser));

        // --- COOKIE PERSISTENCE FOR NEXT.JS MIDDLEWARE ---
        document.cookie = `token=${userToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
        
        dispatch(setUser(createdUser));
      }

      toast.success("Jobseeker account created!");

      // 🎯 DIRECT ROUTING TO PROFILE PAGE AFTER SIGNUP
      router.push("/jobseeker/profile");
    } catch (err) {
      dispatch(setError(err.message));
      toast.error(err.message || "Something went wrong.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-800 pt-24 pb-16 px-4 flex flex-col items-center">
      {/* ================= FORM SECTION ================= */}
      <section className="max-w-3xl w-full mx-auto px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight text-center">
            Create Jobseeker Account
          </h2>
          <p className="text-center text-sm text-slate-500 mb-8">
            Find Your Dream Career
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Full Name *
                </label>
                <input
                  {...register("fullName")}
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Email Address *
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Phone Number *
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Professional Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Professional Title / Role *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Password *
                </label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.</p>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Confirm Password *
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8cc63f] hover:bg-[#7ab332] text-slate-950 font-bold py-3.5 px-6 rounded-xl transition shadow-md cursor-pointer text-sm tracking-wide disabled:opacity-50 mt-6"
            >
              {loading ? "Creating Account..." : "Sign Up as Jobseeker"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#8cc63f] font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}