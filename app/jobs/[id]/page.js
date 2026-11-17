import { Suspense } from "react";
import JobDetailsClient from "./JobDetailsClient";

// Opts out of strict instant-navigation validation for this dynamic route in Next.js 16
export const instant = false;

async function JobContent({ params }) {
  const resolvedParams = await params;
  return <JobDetailsClient jobId={resolvedParams.id} />;
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-medium">Loading job details...</div>}>
      <JobContent params={params} />
    </Suspense>
  );
}