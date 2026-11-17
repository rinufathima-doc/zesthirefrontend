"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id;

  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompanyData = async () => {
      try {
        // Fetch company info
        const compRes = await fetch(`http://localhost:5000/api/companies/${companyId}`);
        const compData = await compRes.json();
        if (compData.success) setCompany(compData.data);

        // Fetch company reviews
        const revRes = await fetch(`http://localhost:5000/api/companies/${companyId}/reviews`);
        const revData = await revRes.json();
        if (revData.success) setReviews(revData.data);
      } catch (err) {
        console.error("Error loading company details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to leave a review.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/companies/${companyId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success("Review posted successfully!");
        setReviews([result.data, ...reviews]);
        setComment("");
      } else {
        toast.error(result.message || "Failed to post review");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-24 text-slate-500">Loading company profile...</div>;
  if (!company) return <div className="text-center py-24 text-slate-500">Company not found.</div>;

  return (
    <div className="bg-white min-h-screen text-slate-800 pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      
      {/* COMPANY HEADER CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            {company.name || company.companyName}
          </h1>
          <p className="text-sm font-medium text-[#8cc63f] mb-3">{company.industry || "Technology / IT"}</p>
          <p className="text-xs text-slate-500">Contact: {company.email}</p>
        </div>
        {company.companyWebsite && (
          <a
            href={company.companyWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-xs rounded-xl transition shadow"
          >
            Visit Website
          </a>
        )}
      </div>

      {/* REVIEWS SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Company Reviews & Ratings</h3>

        {/* Write a Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
          <h4 className="text-sm font-bold text-slate-800">Leave a Review</h4>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Rating (1 to 5 Stars)</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full sm:w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#8cc63f]"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5)</option>
              <option value="4">⭐⭐⭐⭐ (4)</option>
              <option value="3">⭐⭐⭐ (3)</option>
              <option value="2">⭐⭐ (2)</option>
              <option value="⭐ (1)">⭐ (1)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Your Feedback</label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write about work culture, interview process, or management..."
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#8cc63f]"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-xs rounded-lg transition shadow cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Submit Review"}
          </button>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-4 pt-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400">No reviews yet for this company. Be the first to review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                  <span className="text-xs text-amber-500 font-semibold">{"⭐".repeat(rev.rating)}</span>
                </div>
                <p className="text-xs text-slate-600">{rev.comment}</p>
                <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}