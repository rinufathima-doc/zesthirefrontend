
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building2,
  BriefcaseBusiness,
  ArrowUpRight,
  ArrowDownUp,
  X,
  Loader2,
  Globe,
  RefreshCw,
} from "lucide-react";
import Navbar from "../components/Navbar";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [sort, setSort] = useState("asc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch companies whenever filters change
  useEffect(() => {
    const controller = new AbortController();

    const fetchCompanies = async () => {
      setLoading(true);
      setError("");

      try {
        const queryParams = new URLSearchParams();

        if (search.trim()) {
          queryParams.set("search", search.trim());
        }

        if (location.trim()) {
          queryParams.set("location", location.trim());
        }

        if (industry.trim()) {
          queryParams.set("industry", industry.trim());
        }

        queryParams.set("sort", sort);

        const response = await fetch(
          `${API_URL}/api/companies?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load companies.");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Failed to fetch companies."
          );
        }

        setCompanies(
          Array.isArray(result.data) ? result.data : []
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Companies API error:", err);
          setError(err.message || "Something went wrong.");
          setCompanies([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // Debounce search requests
    const timer = setTimeout(fetchCompanies, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, location, industry, sort]);

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setIndustry("");
    setSort("asc");
  };

  const hasFilters =
    search.trim() ||
    location.trim() ||
    industry.trim() ||
    sort !== "asc";

  const getCompanyName = (company) =>
    company.companyName || company.name || "Company";

  const getInitials = (name) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  return (
    <main className="min-h-screen bg-[#f7f9f5] text-slate-900">

      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white">

        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-32">

          <div className="max-w-3xl">

            <span className="inline-flex items-center gap-2 text-lime-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Building2 size={16} />
              ZestHire Company Directory
            </span>

            <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
              Discover companies.
              <span className="block text-lime-400">
                Discover possibilities.
              </span>
            </h1>

            <p className="mt-6 text-slate-300 text-sm sm:text-base leading-7 max-w-xl">
              Explore organizations registered on ZestHire,
              discover different industries and find companies
              that match your career goals.
            </p>

          </div>

        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 -mt-16 z-10">

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200 p-5 sm:p-7">

          <div className="flex items-center gap-2 mb-5">
            <Search className="text-lime-600" size={20} />

            <h2 className="text-base font-bold text-slate-900">
              Find your next company
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Company Search */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Company name
              </label>

              <div className="flex items-center border border-slate-200 rounded-xl px-3 h-12 focus-within:border-lime-500 focus-within:ring-2 focus-within:ring-lime-100 transition">
                <Search size={17} className="text-slate-400 shrink-0" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full outline-none border-none bg-transparent px-3 text-sm text-slate-800 placeholder:text-slate-400"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear company search"
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Location
              </label>

              <div className="flex items-center border border-slate-200 rounded-xl px-3 h-12 focus-within:border-lime-500 focus-within:ring-2 focus-within:ring-lime-100 transition">
                <MapPin size={17} className="text-slate-400 shrink-0" />

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location..."
                  className="w-full outline-none bg-transparent px-3 text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Industry
              </label>

              <div className="flex items-center border border-slate-200 rounded-xl px-3 h-12 focus-within:border-lime-500 focus-within:ring-2 focus-within:ring-lime-100 transition">
                <BriefcaseBusiness size={17} className="text-slate-400 shrink-0" />

                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Technology"
                  className="w-full outline-none bg-transparent px-3 text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Sort companies
              </label>

              <div className="flex items-center border border-slate-200 rounded-xl px-3 h-12">
                <ArrowDownUp size={17} className="text-slate-400 shrink-0" />

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full outline-none bg-transparent px-3 text-sm text-slate-700 cursor-pointer"
                >
                  <option value="asc">Name: A to Z</option>
                  <option value="desc">Name: Z to A</option>
                </select>
              </div>
            </div>

          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-5 border-t border-slate-100">

            <p className="text-xs text-slate-500">
              Search by name, location or industry.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-xs font-bold text-lime-700 hover:text-lime-900"
              >
                <X size={15} />
                Clear all filters
              </button>
            )}

          </div>
        </div>
      </section>

      {/* COMPANY RESULTS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14">

        {/* Section Heading */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">

          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-lime-700 mb-2">
              Explore opportunities
            </p>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Registered Companies
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Discover employers who are part of ZestHire.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3">
            <p className="text-xs text-slate-500">
              Companies found
            </p>

            <p className="text-2xl font-black text-lime-700">
              {loading ? "..." : companies.length}
            </p>
          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-lime-600 animate-spin mb-4" />

            <p className="text-sm text-slate-500 font-medium">
              Finding registered companies...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-3xl p-10 text-center">

            <Building2 size={38} className="text-red-400 mx-auto mb-4" />

            <h3 className="text-lg font-bold text-slate-900">
              Unable to load companies
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch((value) => value + " ");
                setSearch((value) => value.trim());
              }}
              className="mt-6 inline-flex items-center gap-2 bg-lime-500 text-slate-950 px-6 py-3 rounded-xl font-bold text-sm"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {/* Empty Results */}
        {!loading && !error && companies.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl py-20 px-6 text-center">

            <div className="w-16 h-16 rounded-2xl bg-lime-50 flex items-center justify-center mx-auto mb-5">
              <Search size={28} className="text-lime-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              No companies found
            </h3>

            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              We couldn't find any companies matching your
              search. Try changing your keywords or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 bg-lime-500 hover:bg-lime-600 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl transition"
            >
              Show all companies
            </button>

          </div>
        )}

        {/* Company Cards */}
        {!loading && !error && companies.length > 0 && (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {companies.map((company) => {
              const name = getCompanyName(company);

              const description =
                company.bio ||
                company.description ||
                "Discover this company and explore its career opportunities on ZestHire.";

              const logo =
                company.logo ||
                company.companyLogo ||
                company.profilePicture;

              return (
                <article
                  key={company._id}
                  className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-lime-400 hover:shadow-xl hover:shadow-lime-900/5 transition-all duration-300 flex flex-col"
                >

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-6">

                    <div className="w-16 h-16 rounded-2xl bg-lime-50 border border-lime-100 flex items-center justify-center overflow-hidden shrink-0">

                      {logo ? (
                        <img
                          src={logo}
                          alt={`${name} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-black text-lime-700">
                          {getInitials(name)}
                        </span>
                      )}

                    </div>

                    <span className="text-[10px] font-bold tracking-wide uppercase bg-lime-50 text-lime-700 px-3 py-2 rounded-full">
                      Employer
                    </span>

                  </div>

                  {/* Company Name */}
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-lime-700 transition break-words">
                    {name}
                  </h3>

                  <p className="text-sm text-lime-700 font-semibold mt-2">
                    {company.industry || "Industry not specified"}
                  </p>

                  {/* Company Info */}
                  <div className="space-y-3 mt-5">

                    {company.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin size={15} className="text-slate-400 shrink-0" />
                        <span>{company.location}</span>
                      </div>
                    )}

                    {company.companyWebsite && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Globe size={15} className="text-slate-400 shrink-0" />

                        <span className="truncate">
                          {company.companyWebsite.replace(/^https?:\/\//, "")}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 leading-6 mt-5 line-clamp-3 flex-grow">
                    {description}
                  </p>

                  {/* Footer */}
                  <div className="border-t border-slate-100 mt-6 pt-5">

                    <Link
                      href={`/companies/${company._id}`}
                      className="flex items-center justify-between w-full bg-slate-950 hover:bg-lime-500 text-white hover:text-slate-950 rounded-xl px-5 py-3.5 text-sm font-bold transition-all duration-300"
                    >
                      <span>View company</span>
                      <ArrowUpRight size={18} />
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row justify-between gap-4">

          <p className="text-sm font-black text-slate-900">
            Zest<span className="text-lime-600">Hire.</span>
          </p>

          <p className="text-xs text-slate-500">
            Connecting talent with opportunity.
          </p>

        </div>
      </footer>

    </main>
  );
}
