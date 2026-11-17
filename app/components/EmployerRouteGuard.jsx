"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function EmployerGuard({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("employertoken");
    let userRole = localStorage.getItem("role");

    if (!userRole) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userRole = parsed.role || parsed.userType;
        } catch (e) {}
      }
    }

    const normalizedRole = (userRole || "").toLowerCase().trim();

    if (!token || token === "null" || token === "undefined") {
      toast.error("Please log in as an employer to continue.");
      router.replace("/login");
      return;
    }

    if (normalizedRole === "jobseeker" || normalizedRole === "job_seeker") {
      toast.error("Unauthorized access.");
      router.replace("/jobseeker/dashboard");
      return;
    }

    if (normalizedRole !== "employer") {
      toast.error("Employer access required.");
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-6 h-6 border-2 border-[#8cc63f] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Verifying employer access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}