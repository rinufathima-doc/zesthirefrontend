"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Building2, MapPin, Globe, Mail, Phone, ChevronLeft, Send, User, Star } from "lucide-react";
import { toast } from "react-hot-toast";

// Use environment variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Force dynamic rendering so Vercel does not try to statically prerender dynamic routes at build time
export const dynamic = "force-dynamic";

export default function CompanyDetailPage({ params }) {
  // Safely unwrap params using React.use() for Next.js App Router compatibility
  const unwrappedParams = use(params);
  const companyId = unwrappedParams?.id;

  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!companyId) return;

    async function fetchCompanyData() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/jobs/company/${companyId}`);
        if (res.ok) {
          const data = await res.json();
          const compData = data.employer || data.company || data.user || data.data || data;
          setCompany(compData || {});
        } else {
          toast.error("Failed to load company profile.");
          setCompany(null);
        }

        const jobsRes = await fetch(`${API_URL}/api/jobs`);
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          const jobList = Array.isArray(jobsData) ? jobsData : (jobsData?.jobs || []);
          
          const filtered = jobList.filter((job) => {
            const empRef =
              job?.employerId?._id ||
              job?.employerId ||
              job?.postedBy?._id ||
              job?.postedBy ||
              job?.createdBy?._id ||
              job?.createdBy ||
              job?.employer?._id ||
              job?.employer ||
              job?.companyId;
            
            return empRef?.toString() === companyId?.toString();
          });
          setCompanyJobs(filtered);
        }

        // Load reviews from localStorage
        const savedReviews = localStorage.getItem(`company_reviews_${companyId}`);
        if (savedReviews) {
          setReviews(JSON.parse(savedReviews));
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
        toast.error("An error occurred while loading profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyData();
  }, [companyId]);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please write a review comment.");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: reviewerName.trim() || "Anonymous Candidate",
      rating: Number(rating),
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`company_reviews_${companyId}`, JSON.stringify(updatedReviews));

    setComment("");
    setReviewerName("");
    setRating(5);
    toast.success("Review submitted successfully!");
  };

  if (loading || !companyId) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center text-slate-500 text-sm">
        Loading company profile...
      </div>
    );
  }

  if (!company || Object.keys(company).length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center space-y-4 p-6">
        <h1 className="text-2xl font-bold text-slate-800">Company Not Found</h1>
        <p className="text-sm text-slate-500">Could not retrieve details for ID: {companyId}</p>
        <Link href="/companies" className="px-5 py-2.5 bg-[#8cc63f] text-slate-950 font-bold text-xs rounded-xl shadow">
          Back to Companies Directory
        </Link>
      </div>
    );
  }

  const companyName = company?.companyName || company?.name || "Company Profile";
  const initialLetter = companyName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 pb-20">
      {/* Clean Header Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-8 space-y-4">
        <Link href="/companies" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Companies</span>
        </Link>
        <div className="flex items-center space-x-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-[#8cc63f] border border-slate-200 flex items-center justify-center font-bold text-2xl shadow-sm">
            {initialLetter}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {companyName}
            </h1>
            <p className="text-xs text-[#8cc63f] font-semibold mt-1">
              {company?.industry || "Technology & Services"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Company Details & Reviews */}
        <div className="space-y-6 md:col-span-1">
          {/* Company Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Company Details</h3>
            <div className="space-y-4 text-xs text-slate-600">
              {company?.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{company.location}</span>
                </div>
              )}
              {company?.companyWebsite && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <a href={company.companyWebsite} target="_blank" rel="noreferrer" className="text-[#8cc63f] hover:underline truncate">
                    {company.companyWebsite}
                  </a>
                </div>
              )}
              {company?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{company.email}</span>
                </div>
              )}
              {company?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{company.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Reviews Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Candidate Reviews</span>
              <span className="text-xs bg-[#8cc63f]/10 text-[#7cb342] px-2 py-0.5 rounded-full font-semibold">
                {reviews.length}
              </span>
            </h3>

            {/* Write Review Form */}
            <form onSubmit={handleAddReview} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-700">Write a Review</h4>
              <div>
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8cc63f]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Rating:</span>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8cc63f]"
                >
                  <option value={5}>5 / 5 Stars</option>
                  <option value={4}>4 / 5 Stars</option>
                  <option value={3}>3 / 5 Stars</option>
                  <option value={2}>2 / 5 Stars</option>
                  <option value={1}>1 / 5 Star</option>
                </select>
              </div>
              <div>
                <textarea
                  placeholder="Share your interview or work experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8cc63f] resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-xs rounded-lg shadow transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Review</span>
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No reviews yet. Be the first to write one!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <User className="w-3 h-3 text-[#8cc63f]" />
                        <span>{rev.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center space-x-0.5 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: About & Open Positions */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">About the Company</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {company?.bio || company?.description || "No description provided by this company yet."}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Open Positions ({companyJobs.length})</h3>
            {companyJobs.length === 0 ? (
              <p className="text-xs text-slate-400">No active job openings at the moment.</p>
            ) : (
              <div className="space-y-3">
                {companyJobs.map((job) => (
                  <div key={job?._id || job?.id} className="p-4 border border-slate-100 hover:border-slate-200 rounded-2xl flex items-center justify-between transition bg-slate-50/50">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{job?.title || "Position"}</h4>
                      <p className="text-xs text-slate-500">
                        {job?.location || "Remote"} • {job?.jobType || job?.type || "Full Time"}
                      </p>
                    </div>
                    <Link href={`/jobseeker/apply/${job?._id || job?.id}`} className="px-4 py-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer transition">
                      Apply
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}