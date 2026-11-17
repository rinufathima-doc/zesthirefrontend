"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSettingsSchema } from "@/lib/validations/account";

export default function AccountSettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      email: "user@example.com",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      emailNotifications: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      console.log("Account Settings Data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log("Error updating account settings:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isSubmitSuccessful && (
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm">
          Account settings updated successfully!
        </div>
      )}

      {/* Email Setting */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          {...register("email")}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
        )}
      </div>

      <hr className="border-slate-200 dark:border-slate-800 my-6" />

      {/* Password Management */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Change Password
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Current Password *
          </label>
          <input
            type="password"
            {...register("currentPassword")}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="••••••••"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-rose-500">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              {...register("newPassword")}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800 my-6" />

      {/* Notification Preferences */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Email Notifications
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Receive updates on applicant updates, messages, and job alerts.
          </p>
        </div>
        <input
          type="checkbox"
          {...register("emailNotifications")}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Updating..." : "Update Settings"}
        </button>
      </div>
    </form>
  );
}