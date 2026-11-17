"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useJobSeekerAuth() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined" || token === "null") {
      router.replace("/login");
      return;
    }

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
    if (normalizedRole === "employer") {
      router.replace("/employer/dashboard");
      return;
    }

    if (!normalizedRole) {
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  return isAuthorized;
}