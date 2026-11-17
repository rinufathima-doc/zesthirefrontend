"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employerProfileSchema } from "@/lib/validations/employer";

export default function EmployerProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      companyName: "",
      website: "",
      industry: "",
      companySize: "11-50",
      about: "",
      location: "",
      logoUrl: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      console.log("Employer Profile Data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log("Error updating employer profile:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isSubmitSuccessful && (
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm">
          Employer profile updated successfully!
        </div>
      )}

      {/* Rest of your JSX form fields remain exactly the same */}
    </form>
  );
}