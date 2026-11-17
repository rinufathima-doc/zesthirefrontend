"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRole }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1. If there is no token, redirect to login
    if (!token || token === "undefined" || token === "null") {
      console.warn("ProtectedRoute: No valid token found. Redirecting to login.");
      router.push("/login");
      return;
    }

    // 2. Retrieve user role from localStorage
    let userRole = localStorage.getItem("role");
    
    if (!userRole) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userRole = parsedUser.role || parsedUser.userType || parsedUser.type;
        } catch (e) {
          console.error("ProtectedRoute: Failed to parse user from localStorage", e);
        }
      }
    }

    // 3. Strict role check
    if (allowedRole) {
      if (!userRole) {
        console.warn("ProtectedRoute: Role required but none found in session. Redirecting.");
        router.push("/login");
        return;
      }

      const normalizedUserRole = userRole.toLowerCase().trim();
      const normalizedAllowedRole = allowedRole.toLowerCase().trim();

      if (normalizedUserRole !== normalizedAllowedRole) {
        console.warn(`ProtectedRoute: Role mismatch. User is '${normalizedUserRole}', but route requires '${normalizedAllowedRole}'.`);
        router.push("/");
        return;
      }
    }

    // Authorization passed successfully
    setAuthorized(true);
  }, [router, allowedRole]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-6 h-6 border-2 border-[#8cc63f] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Verifying secure access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}