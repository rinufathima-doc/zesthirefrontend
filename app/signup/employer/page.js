"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { employerSignupSchema } from "../../lib/validations/auth";
import { setUser, setLoading, setError } from "../../lib/features/jobSlice";

// Use 127.0.0.1 to avoid Windows localhost IPv6 connection bugs
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function EmployerSignupPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.job || state);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employerSignupSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      industry: "",
      companyWebsite: "",
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
          ...data,
          name: data.companyName, // Maps companyName to backend 'name'
          role: "employer",
        }),
      });

      const result = await res
        .json()
        .catch(() => ({ message: "Server connection failed" }));

      if (!res.ok) throw new Error(result.message || "Signup failed");

      const userToken = result.token;
      const userRole = result.user?.role || "employer";

      if (userToken) {
        // --- LOCALSTORAGE PERSISTENCE ---
        localStorage.setItem("token", userToken);
        localStorage.setItem("employertoken", userToken);
        localStorage.setItem("role", userRole);
        localStorage.setItem("user", JSON.stringify(result.user));

        // --- COOKIE PERSISTENCE FOR NEXT.JS MIDDLEWARE ---
        document.cookie = `token=${userToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `employertoken=${userToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
      }

      dispatch(setUser(result.user));

      toast.success("Employer account created!");
      router.push("/employer/dashboard");
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
            Create Employer Account
          </h2>
          <p className="text-center text-sm text-slate-500 mb-8">
            Start Posting Job Openings
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 2-Column Grid for Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Company Name *
                </label>
                <input
                  {...register("companyName")}
                  type="text"
                  placeholder="Acme Corp"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.companyName && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.companyName.message}
                  </p>
                )}
              </div>
              {/* Contact Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Contact Name *
                </label>
                <input
                  {...register("contactName")}
                  type="text"
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.contactName && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.contactName.message}
                  </p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Work Email *
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="hr@acme.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Industry *
                </label>
                <input
                  {...register("industry")}
                  type="text"
                  placeholder="Software / IT"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.industry && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.industry.message}
                  </p>
                )}
              </div>

              {/* Company Website */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Company Website (Optional)
                </label>
                <input
                  {...register("companyWebsite")}
                  type="text"
                  placeholder="https://acme.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f] text-sm transition"
                />
                {errors.companyWebsite && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.companyWebsite.message}
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
                <p className="text-[11px] text-slate-500 mt-1">Min 8 chars, 1 uppercase, 1 number, 1 special char.</p>
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
              {loading ? "Creating Account..." : "Sign Up as Employer"}
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