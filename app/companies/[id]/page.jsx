"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { Search, MapPin, Building2, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchRegisteredEmployers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (locationFilter) queryParams.append("location", locationFilter);
      if (industryFilter) queryParams.append("industry", industryFilter);
      queryParams.append("sort", sortOrder);

      const res = await fetch(`${API_URL}/api/companies?${queryParams.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        // Extracts the data array directly from your backend controller's { success, count, data } response
        setCompanies(json.data || []);
      } else {
        toast.error(json.message || "Failed to load registered employers");
        setCompanies([]);
      }
    } catch (err) {
      console.error("Error fetching employers:", err);
      toast.error("Could not connect to server");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisteredEmployers();
  }, [sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRegisteredEmployers();
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800">
      {/* Hero Header */}
      <div 
        className="relative bg-slate-900 bg-cover bg-center pt-32 pb-20 text-white border-b border-slate-800"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80")' 
        }}
      >
        <Navbar />

        <div className="max-w-7xl mx-auto px-8 text-center mt-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            Registered Employers Directory
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-4">
            Explore verified companies hiring top talent on ZestHire.
          </p>
          <nav className="text-sm font-medium text-slate-300 space-x-2">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8cc63f] font-semibold">Companies</span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Filter Employers
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Search Name / Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. TechCorp"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8cc63f] focus:bg-white text-slate-800 placeholder-slate-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kozhikode"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8cc63f] focus:bg-white text-slate-800 placeholder-slate-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software"
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8cc63f] focus:bg-white text-slate-800 placeholder-slate-400 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2d3748] hover:bg-[#1a202c] text-white font-semibold text-xs rounded-xl transition shadow-sm cursor-pointer"
              >
                Apply Filters
              </button>
            </form>
          </aside>

          {/* Companies Grid */}
          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">
                Showing <span className="text-[#8cc63f]">{companies.length}</span> registered employers
              </h2>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="asc">A to Z</option>
                  <option value="desc">Z to A</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="bg-white p-16 text-center rounded-2xl border border-slate-200 text-slate-500 shadow-sm">
                <p className="text-sm font-semibold">Loading registered companies from database...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-2xl border border-slate-200 text-slate-500 shadow-sm">
                <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-base font-bold text-slate-700">No registered employers found</p>
                <p className="text-xs text-slate-400 mt-1">Make sure employers are registered in your MongoDB database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companies.map((emp) => {
                  const companyId = emp?._id || emp?.id;
                  const companyName = emp?.companyName || emp?.name || "Company Profile";
                  const initial = companyName.charAt(0).toUpperCase();

                  return (
                    <div
                      key={companyId}
                      className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-[#8cc63f] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold text-[#8cc63f] shadow-sm overflow-hidden border border-slate-200 flex-shrink-0">
                            {emp?.logoUrl ? (
                              <img src={emp.logoUrl} alt={companyName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-50 text-[#8cc63f] border border-emerald-200/60 rounded-full text-[10px] font-bold">
                            {emp?.industry || "Technology & Services"}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {companyName}
                        </h3>

                        {emp?.location && (
                          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-3">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{emp.location}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {emp?.bio || emp?.description || "Verified registered employer on ZestHire job portal."}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Verified Employer</span>
                        {companyId && (
                          <Link
                            href={`/companies/${companyId}`}
                            className="px-4 py-2 bg-slate-900 hover:bg-[#8cc63f] hover:text-slate-950 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center space-x-1"
                          >
                            <span>View Profile</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}