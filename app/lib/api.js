import { toast } from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000/api";

export async function apiFetch(endpoint, options = {}) {
  // 1. Retrieve and validate token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isValidToken = token && token !== "null" && token !== "undefined" && token.trim().length > 10;

  // 2. If the request requires authentication but there's no valid token, abort early
  if (options.requiresAuth && !isValidToken) {
    console.warn(`[API Guard] Skipped ${endpoint}: No valid token found.`);
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  // 3. Build headers
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(isValidToken ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 4. Handle 401 Unauthorized globally (Token expired / invalid)
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        // Optional: show toast only if not already on the login page
        if (!window.location.pathname.includes("/login")) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
      }
      return { ok: false, status: 401, message: "Unauthorized" };
    }

    // 5. Parse JSON response safely
    const data = await response.json();
    return {
      ok: response.ok,
      status: response.status,
      ...data,
    };
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    return { ok: false, status: 500, message: err.message || "Network error" };
  }
}   