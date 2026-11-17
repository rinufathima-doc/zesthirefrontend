"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (selectedLocation) queryParams.append("location", selectedLocation);
      if (selectedIndustry) queryParams.append("industry", selectedIndustry);
      queryParams.append("sort", sortOrder);

      const res = await fetch(`${API_URL}/api/companies?${queryParams.toString()}`);
      const result = await res.json();
      
      if (res.ok && result.success) {
        setCompanies(result.data || []);
      } else {
        toast.error(result.message || "Failed to load companies");
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      toast.error("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800">
      {/* Dynamic Dark Hero Header */}
      <div 
        className="relative bg-slate-900 bg-cover bg-center pt-32 pb-20 text-white border-b border-slate-800"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80")' 
        }}
      >
        <Navbar />

        <div className="max-w-7xl mx-auto px-8 text-center mt-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3">
            Companies Directory
          </h1>
          <nav className="text-sm font-medium text-slate-300 space-x-2">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8cc63f] font-semibold">Companies</span>
          </nav>
        </div>
      </div>

      {/* Main Content Directory */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters */}
          <aside className="lg:col-span-1">
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Search by Keywords
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8cc63f] focus:bg-white text-slate-800 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kozhikode, Kochi"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8cc63f] focus:bg-white text-slate-800 placeholder-slate-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software / IT"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8cc63f] focus:bg-white text-slate-800 placeholder-slate-400 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#2d3748] hover:bg-[#1a202c] text-white font-semibold text-sm rounded-xl transition shadow-sm cursor-pointer"
              >
                Find Companies
              </button>
            </form>
          </aside>

          {/* Right Section: Registered Companies Grid */}
          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Showing {companies.length} companies
              </h2>

              <div className="flex items-center space-x-2">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="asc">Name Asc (A-Z)</option>
                  <option value="desc">Name Desc (Z-A)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
                <p className="text-sm font-semibold">Loading companies...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
                <p className="text-base font-semibold text-slate-700">No registered companies available.</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => {
                  const companyName = company.companyName || company.name || "Company";
                  const companyId = company._id || company.id;
                  return (
                    <div
                      key={companyId}
                      className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-[#8cc63f] hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-[#8cc63f] mb-5 shadow-sm overflow-hidden border border-slate-200">
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt={companyName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{companyName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {companyName}
                        </h3>

                        <p className="text-xs font-medium text-[#8cc63f] mb-3">
                          {company.industry || "General Industry"}
                        </p>

                        <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-2">
                          {company.description || company.email || "Registered employer on job portal."}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Verified Employer</span>
                        <Link
                          href={`/companies/${companyId}`}
                          className="px-3.5 py-1.5 bg-slate-50 hover:bg-[#8cc63f] hover:text-slate-950 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition"
                        >
                          View & Reviews
                        </Link>
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