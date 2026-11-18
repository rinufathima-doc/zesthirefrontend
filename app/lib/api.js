import { toast } from "react-hot-toast";

const API_BASE_URL = `${(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "")}/api`;

export async function apiFetch(endpoint, options = {}) {
  // 1. Retrieve and validate token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isValidToken =
    token &&
    token !== "null" &&
    token !== "undefined" &&
    token.trim().length > 10;

  if (options.requiresAuth && !isValidToken) {
    console.warn(`[API Guard] Skipped ${endpoint}: No valid token found.`);
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(isValidToken ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${API_BASE_URL}${formattedEndpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        // Clear localStorage
        localStorage.clear();

        document.cookie = "token=; path=/; max-age=0;";
        document.cookie = "employertoken=; path=/; max-age=0;";
        document.cookie = "role=; path=/; max-age=0;";

        if (!window.location.pathname.includes("/login")) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
      }
      return { ok: false, status: 401, message: "Unauthorized" };
    }

    const contentType = response.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : {};

    return {
      ok: response.ok,
      status: response.status,
      ...data,
    };
  } catch (err) {
    console.error(`[API Error] ${formattedEndpoint}:`, err);
    return { ok: false, status: 500, message: err.message || "Network error" };
  }
}