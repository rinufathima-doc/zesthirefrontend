'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';

// Fallback dataset matching your homepage/jobs list
const defaultListings = [
  {
    id: "1",
    title: "Product Designer",
    company: "Adidas",
    location: "New York, New York",
    type: "Part Time",
    logo: "/images/logo-adidas.png",
    description: "We are seeking an experienced Product Designer to lead user-centered product design initiatives.",
    salary: "$90,000 - $120,000 / year",
    publishedOn: "Oct 12, 2026",
    vacancy: 2,
    experience: "3+ Years",
    deadline: "Nov 30, 2026"
  },
  {
    id: "2",
    title: "Digital Marketing Director",
    company: "Sprint",
    location: "Overland Park, Kansas",
    type: "Full Time",
    logo: "/images/logo-sprint.png",
    description: "Lead global marketing strategy and growth campaigns for enterprise solutions.",
    salary: "$130,000 - $160,000 / year",
    publishedOn: "Oct 15, 2026",
    vacancy: 1,
    experience: "5+ Years",
    deadline: "Dec 15, 2026"
  },
  {
    id: "3",
    title: "Back-end Engineer (Python)",
    company: "Amazon",
    location: "Overland Park, Kansas",
    type: "Full Time",
    logo: "/images/logo-amazon.png",
    description: "Build robust, scalable APIs and cloud services using Python and AWS ecosystem.",
    salary: "$140,000 - $175,000 / year",
    publishedOn: "Oct 20, 2026",
    vacancy: 4,
    experience: "4+ Years",
    deadline: "Dec 01, 2026"
  },
  {
    id: "4",
    title: "Senior Art Director",
    company: "Microsoft",
    location: "Anywhere",
    type: "Full Time",
    logo: "/images/logo-microsoft.png",
    description: "Oversee visual identities, creative direction, and digital branding assets.",
    salary: "$150,000 - $190,000 / year",
    publishedOn: "Oct 22, 2026",
    vacancy: 1,
    experience: "6+ Years",
    deadline: "Nov 25, 2026"
  }
];

export default function JobDetailsClient({ jobId }) {
  const dispatch = useDispatch();

  // 1. Grab state safely from Redux
  const reduxState = useSelector((state) => state);
  const list = reduxState?.job?.list || reduxState?.list || [];
  const savedIds = reduxState?.savedIds || [];

  // 2. Use Redux list if available, otherwise use default fallback list
  const activeJobs = list.length > 0 ? list : defaultListings;

  // 3. Find the matching job (comparing string to string)
  const job = activeJobs.find((item) => String(item.id) === String(jobId));

  if (!job) {
    return (
      <main className="min-h-screen bg-white px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Job not found (ID: {jobId})
        </h1>
        <p className="mt-3 text-slate-500">
          The requested job could not be found.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-[#D4F626] px-6 py-3 font-bold text-slate-950 shadow-sm"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  const isSaved = savedIds.includes(job.id);

  const handleSave = () => {
    dispatch({
      type: 'toggleSaveJob',
      payload: job.id,
    });
  };

  const handleApply = () => {
    alert(`Application submitted for ${job.title} at ${job.company}!`);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <main className="min-h-screen bg-white py-10 text-slate-800">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Back Navigation */}
        <Link
          href="/jobs"
          className="mb-8 inline-block text-sm font-semibold text-slate-700 hover:text-slate-950 transition"
        >
          &larr; Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Career Opportunity
          </p>

          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {job.title}
          </h1>

          <p className="mt-3 text-slate-500">
            {job.company} <span className="mx-2">•</span>
            {job.location} <span className="mx-2">•</span>
            {job.type || 'Full-time'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleApply}
              className="rounded-xl bg-[#D4F626] hover:bg-[#bce410] px-6 py-3 font-bold text-slate-950 transition shadow-sm cursor-pointer"
            >
              Apply for This Job
            </button>

            <button
              onClick={handleSave}
              className={`rounded-xl border px-6 py-3 font-semibold transition cursor-pointer ${
                isSaved
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSaved ? '♥ Saved' : '♡ Save Job'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">

          {/* Left Column */}
          <div className="lg:col-span-8">

            {/* Job Image */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center p-8">
              <img
                src={job.logo || job.image || '/images/logo-placeholder.png'}
                alt={`${job.company} workplace`}
                className="max-h-48 object-contain"
              />
            </div>

            {/* Job Description */}
            <section className="mt-12">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                Job Description
              </h2>

              <div className="space-y-5 leading-8 text-slate-600">
                <p>
                  {job.description ||
                    'Explore this exciting career opportunity and learn more about the role, responsibilities, and qualifications.'}
                </p>

                <h3 className="pt-3 text-xl font-semibold text-slate-900">
                  Responsibilities
                </h3>

                <p>
                  Work collaboratively with the team, contribute to projects,
                  solve problems, and help achieve company goals.
                </p>

                <h3 className="pt-3 text-xl font-semibold text-slate-900">
                  Requirements
                </h3>

                <p>
                  Candidates should have relevant skills, a willingness to
                  learn, good communication, and the ability to work
                  effectively with others.
                </p>
              </div>

              <button
                onClick={handleApply}
                className="mt-8 rounded-xl bg-[#D4F626] hover:bg-[#bce410] px-8 py-3.5 font-bold text-slate-950 transition shadow-sm cursor-pointer"
              >
                Apply Now
              </button>
            </section>
          </div>

          {/* Right Column */}
          <aside className="lg:col-span-4">

            {/* Job Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <h2 className="mb-6 text-xl font-bold text-slate-900">
                Job Summary
              </h2>

              <div className="space-y-4 text-sm">
                <p>
                  <strong className="text-slate-900">Company: </strong>
                  <span className="text-slate-600">{job.company}</span>
                </p>

                <p>
                  <strong className="text-slate-900">Job Title: </strong>
                  <span className="text-slate-600">{job.title}</span>
                </p>

                <p>
                  <strong className="text-slate-900">Published on: </strong>
                  <span className="text-slate-600">
                    {job.publishedOn || 'Oct 24, 2026'}
                  </span>
                </p>

                <p>
                  <strong className="text-slate-900">Vacancy: </strong>
                  <span className="text-slate-600">
                    {job.vacancy ?? 1}
                  </span>
                </p>

                <p>
                  <strong className="text-slate-900">
                    Employment Status:{' '}
                  </strong>
                  <span className="text-slate-600">
                    {job.type || 'Full-time'}
                  </span>
                </p>

                <p>
                  <strong className="text-slate-900">Experience: </strong>
                  <span className="text-slate-600">
                    {job.experience || 'Not specified'}
                  </span>
                </p>

                <p>
                  <strong className="text-slate-900">Job Location: </strong>
                  <span className="text-slate-600">{job.location}</span>
                </p>

                <p>
                  <strong className="text-slate-900">Salary: </strong>
                  <span className="text-slate-600">
                    {job.salary || 'Competitive'}
                  </span>
                </p>

                <p>
                  <strong className="text-slate-900">
                    Application Deadline:{' '}
                  </strong>
                  <span className="text-slate-600">
                    {job.deadline || 'Dec 31, 2026'}
                  </span>
                </p>
              </div>
            </div>

            {/* Share Card */}
            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <h2 className="mb-5 text-xl font-bold text-slate-900">
                Share
              </h2>

              <div className="flex flex-wrap gap-5 font-semibold text-slate-700 text-sm">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Facebook"
                  className="hover:text-slate-950 transition"
                >
                  Facebook
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(job.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Twitter"
                  className="hover:text-slate-950 transition"
                >
                  Twitter
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(shareUrl);
                    alert('Job link copied!');
                  }}
                  className="hover:text-slate-950 transition cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}