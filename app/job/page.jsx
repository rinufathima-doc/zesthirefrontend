"use client";

import React from "react";
import Link from "next/link";

export default function JobsPage() {
  return (
    <div className="bg-white min-h-screen text-slate-800 py-20 px-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
        Available Job Listings
      </h1>
      <p className="text-slate-600 mb-6">
        Explore open positions on ZESTHIRE.
      </p>
      <Link
        href="/jobseeker/profile"
        className="inline-block bg-[#8cc63f] text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm"
      >
        Go to Profile
      </Link>
    </div>
  );
}