import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read cookies securely on the server
  const token = 
    request.cookies.get("token")?.value || 
    request.cookies.get("employertoken")?.value;
    
  const role = request.cookies.get("role")?.value?.toLowerCase()?.trim();

  // 1. Protect Employer Routes (/employer/*)
  if (pathname.startsWith("/employer")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role === "jobseeker" || role === "job_seeker") {
      return NextResponse.redirect(new URL("/jobseeker/dashboard", request.url));
    }
  }

  // 2. Protect Jobseeker Routes (/jobseeker/*)
  if (pathname.startsWith("/jobseeker")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role === "employer" || role === "recruiter") {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Tell Next.js which paths to intercept and protect
export const config = {
  matcher: ["/employer/:path*", "/jobseeker/:path*"],
};