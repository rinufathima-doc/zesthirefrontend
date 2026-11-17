
"use client";

import React, {
  useState,
  useEffect,
  Suspense,
} from "react";

import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

function CompanyDetailContent() {
  const params = useParams();
  const companyId = params?.id;

  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch company using your EXISTING GET /api/companies endpoint
  useEffect(() => {
    if (!companyId) return;

    const controller = new AbortController();

    async function fetchCompanyData() {
      setLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/api/companies`,
          {
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Companies request failed (${response.status})`
          );
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Unable to fetch companies.");
        }

        // Find the requested company by MongoDB ID
        const selectedCompany = result.data.find(
          (item) =>
            String(item._id) === String(companyId)
        );

        if (!selectedCompany) {
          throw new Error(
            "Company not found. Please check the company ID."
          );
        }

        setCompany(selectedCompany);

        // Fetch reviews separately.
        // This endpoint must already exist in your backend.
        setReviewLoading(true);

        try {
          const reviewResponse = await fetch(
            `${API_URL}/api/companies/${companyId}/reviews`,
            {
              headers: {
                Accept: "application/json",
              },
              signal: controller.signal,
            }
          );

          if (reviewResponse.ok) {
            const reviewResult = await reviewResponse.json();

            if (
              reviewResult.success &&
              Array.isArray(reviewResult.data)
            ) {
              setReviews(reviewResult.data);
            }
          } else {
            console.warn(
              "Review endpoint returned:",
              reviewResponse.status
            );
          }
        } catch (reviewError) {
          if (reviewError.name !== "AbortError") {
            console.error("Review loading error:", reviewError);
          }
        } finally {
          if (!controller.signal.aborted) {
            setReviewLoading(false);
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Company loading error:", error);
          toast.error(error.message || "Unable to load company.");
          setCompany(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCompanyData();

    return () => controller.abort();
  }, [companyId]);

  // Submit company review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to leave a review.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write your feedback.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/companies/${companyId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: Number(rating),
            comment: comment.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to post review."
        );
      }

      toast.success("Review posted successfully!");

      if (result.data) {
        setReviews((previous) => [
          result.data,
          ...previous,
        ]);
      }

      setComment("");
      setRating(5);
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error(error.message || "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const companyName =
    company?.companyName || company?.name || "Company";

  const logo =
    company?.logo ||
    company?.companyLogo ||
    company?.profilePicture;

  const website = company?.companyWebsite
    ? /^https?:\/\//i.test(company.companyWebsite)
      ? company.companyWebsite
      : `https://${company.companyWebsite}`
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#8cc63f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">
            Loading company profile...
          </p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
        <div className="text-5xl mb-4">🏢</div>
        <h1 className="text-2xl font-bold text-slate-900">
          Company not found
        </h1>
        <p className="text-slate-500 mt-2">
          This company may not exist or may have been removed.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* COMPANY PROFILE */}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            <div className="w-24 h-24 shrink-0 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              {logo ? (
                <img
                  src={logo}
                  alt={`${companyName} logo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-4xl font-bold text-slate-400">
                  {companyName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {companyName}
              </h1>

              <p className="text-sm font-semibold text-[#78a832] mt-2">
                {company.industry || "Industry not specified"}
              </p>

              {company.location && (
                <p className="text-sm text-slate-500 mt-2">
                  📍 {company.location}
                </p>
              )}

              {company.email && (
                <p className="text-sm text-slate-500 mt-2">
                  ✉ {company.email}
                </p>
              )}
            </div>

            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-sm rounded-xl transition"
              >
                Visit Website ↗
              </a>
            )}

          </div>

          {(company.bio || company.description) && (
            <div className="border-t border-slate-100 mt-8 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                About the Company
              </h2>

              <p className="text-sm leading-7 text-slate-600 whitespace-pre-line">
                {company.bio || company.description}
              </p>
            </div>
          )}

        </section>

        {/* REVIEWS */}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">

          <div className="flex items-center justify-between gap-3 mb-7">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Company Reviews & Ratings
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Read what people say about this company.
              </p>
            </div>

            <span className="text-sm font-semibold text-slate-500">
              {reviews.length} Reviews
            </span>
          </div>

          {/* REVIEW FORM */}

          <form
            onSubmit={handleReviewSubmit}
            className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 space-y-5"
          >
            <h3 className="text-base font-bold text-slate-900">
              Leave a Review
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Your Rating
              </label>

              <select
                value={rating}
                onChange={(e) =>
                  setRating(Number(e.target.value))
                }
                className="w-full sm:w-52 px-3 py-3 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-[#8cc63f]"
              >
                <option value={5}>⭐⭐⭐⭐⭐ - 5 Stars</option>
                <option value={4}>⭐⭐⭐⭐ - 4 Stars</option>
                <option value={3}>⭐⭐⭐ - 3 Stars</option>
                <option value={2}>⭐⭐ - 2 Stars</option>
                <option value={1}>⭐ - 1 Star</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Your Feedback
              </label>

              <textarea
                rows={4}
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                placeholder="Write about work culture, interview process, management, or your experience..."
                required
                maxLength={2000}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm outline-none resize-y focus:border-[#8cc63f]"
              />

              <p className="text-xs text-slate-400 text-right mt-1">
                {comment.length}/2000
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-6 py-3 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-sm rounded-lg transition disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Submit Review"}
            </button>
          </form>

          {/* REVIEW LIST */}

          <div className="mt-9 space-y-5">

            <h3 className="text-lg font-bold text-slate-900">
              What People Are Saying
            </h3>

            {reviewLoading ? (
              <p className="text-sm text-slate-500">
                Loading reviews...
              </p>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-slate-600 font-semibold">
                  No reviews yet
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Be the first person to review this company!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <article
                  key={review._id}
                  className="border-b border-slate-100 pb-5 last:border-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-sm text-slate-900">
                      {review.userName || "Anonymous"}
                    </p>

                    <span className="text-amber-500 text-sm">
                      {"⭐".repeat(
                        Math.min(
                          5,
                          Math.max(0, Number(review.rating) || 0)
                        )
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-7 mt-2 whitespace-pre-line">
                    {review.comment}
                  </p>

                  {review.createdAt && (
                    <p className="text-xs text-slate-400 mt-3">
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}
                    </p>
                  )}
                </article>
              ))
            )}

          </div>

        </section>

      </div>
    </main>
  );
}

// Suspense wrapper required by Next.js
export default function CompanyDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          Loading company profile...
        </div>
      }
    >
      <CompanyDetailContent />
    </Suspense>
  );
}