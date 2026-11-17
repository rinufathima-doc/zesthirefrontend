"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "./components/Navbar"; // Adjust path if needed

// Static reference to prevent Redux selector re-render warning
const EMPTY_ARRAY = [];

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Memoized fallback reference prevents infinite selector warnings
  const list = useSelector((state) => state.job?.list || state.list || EMPTY_ARRAY);

  const [keywordInput, setKeywordInput] = useState("");
  const [regionInput, setRegionInput] = useState("Anywhere");
  const [typeInput, setTypeInput] = useState("Full Time");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "setSearchKeyword", payload: keywordInput });
    dispatch({ type: "setRegion", payload: regionInput });
    dispatch({ type: "setJobType", payload: typeInput });
    router.push("/jobs");
  };

  const handleKeywordClick = (kw) => {
    setKeywordInput(kw);
    dispatch({ type: "setSearchKeyword", payload: kw });
    router.push("/jobs");
  };

  const scrollToStats = () => {
    const statsElement = document.getElementById("stats-section");
    if (statsElement) {
      statsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Default fallback listings matching screenshot if Redux list is empty
  const defaultListings = [
    {
      id: "1",
      title: "Product Designer",
      company: "Adidas",
      location: "New York, New York",
      type: "Part Time",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
      typeColor: "bg-rose-500 text-white",
    },
    {
      id: "2",
      title: "Digital Marketing Director",
      company: "Sprint",
      location: "Overland Park, Kansas",
      type: "Full Time",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Sprint_Corporation_logo.svg",
      typeColor: "bg-[#8cc63f] text-white",
      highlighted: true,
    },
    {
      id: "3",
      title: "Back-end Engineer (Python)",
      company: "Amazon",
      location: "Overland Park, Kansas",
      type: "Full Time",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      typeColor: "bg-[#8cc63f] text-white",
    },
    {
      id: "4",
      title: "Senior Art Director",
      company: "Microsoft",
      location: "Anywhere",
      type: "Full Time",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
      typeColor: "bg-[#8cc63f] text-white",
    },
  ];

  // Logos for "Company We've Helped" section
  const companyLogos = [
    { name: "Mailchimp", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Mailchimp_Logo.svg" },
    { name: "PayPal", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
    { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" },
    { name: "Visa", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { name: "Tinder", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Tinder_logo_2017.svg" },
    { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
    { name: "Airbnb", logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%26W.svg" },
  ];

  const jobsToDisplay = list.length > 0 ? list : defaultListings;

  return (
    <div className="bg-white min-h-screen text-slate-800">
      {/* ================= 1. HERO HEADER WITH DARK BACKGROUND ================= */}
      <div
        className="relative text-white pt-40 pb-36 px-4 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.88)), url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1600")',
        }}
      >
        <Navbar />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6 mt-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            The Easiest Way To Get Your Dream Job
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
            Explore thousands of job listings and connect with top employers worldwide through ZESTHIRE.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-3 rounded-lg shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-3 mt-8"
          >
            <div className="flex-1 flex items-center px-4 py-3 bg-white rounded border border-slate-200">
              <input
                type="text"
                placeholder="Job title, Company..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm font-medium"
              />
            </div>

            <div className="flex-1 flex items-center px-4 py-3 bg-white rounded border border-slate-200">
              <select
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                className="w-full bg-transparent text-gray-900 focus:outline-none text-sm font-medium cursor-pointer"
              >
                <option value="Anywhere">Select Region</option>
                <option value="San Francisco">San Francisco</option>
                <option value="New York">New York</option>
                <option value="Seattle">Seattle</option>
              </select>
            </div>

            <div className="flex-1 flex items-center px-4 py-3 bg-white rounded border border-slate-200">
              <select
                value={typeInput}
                onChange={(e) => setTypeInput(e.target.value)}
                className="w-full bg-transparent text-gray-900 focus:outline-none text-sm font-medium cursor-pointer"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-[#8cc63f] hover:bg-[#7cb342] text-white px-8 py-3.5 rounded font-bold text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Search Job</span>
            </button>
          </form>

          {/* Trending Keywords */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-sm text-slate-300">
            <span className="font-medium">Trending Keywords:</span>
            {["UI Designer", "Python", "Developer"].map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleKeywordClick(kw)}
                className="border border-white/40 hover:border-white px-3 py-1 rounded text-xs font-semibold transition bg-black/20 cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll Button */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30">
          <button
            onClick={scrollToStats}
            className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Scroll to stats"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ================= 2. ZESTHIRE SITE STATS ================= */}
      <section
        id="stats-section"
        className="relative z-10 bg-[#8cc63f] text-white py-20 px-6 pt-24"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            ZESTHIRE Site Stats
          </h2>
          <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto mb-16 font-normal">
            Discover our platform metrics showing active recruitment success and community engagement.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2">
                1,930
              </span>
              <span className="text-sm md:text-base font-semibold text-white uppercase tracking-wider">
                Candidates
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2">
                54
              </span>
              <span className="text-sm md:text-base font-semibold text-white uppercase tracking-wider">
                Jobs Posted
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2">
                120
              </span>
              <span className="text-sm md:text-base font-semibold text-white uppercase tracking-wider">
                Jobs Filled
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2">
                550
              </span>
              <span className="text-sm md:text-base font-semibold text-white uppercase tracking-wider">
                Companies
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. JOB LISTINGS SECTION ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12 tracking-tight">
          43,167 Job Listed
        </h2>

        <div className="bg-white border border-slate-100 rounded-lg shadow-sm divide-y divide-slate-100 overflow-hidden">
          {jobsToDisplay.map((job) => {
            const isPartTime = job.type === "Part Time";
            const badgeBg = isPartTime ? "bg-[#e04f5f]" : "bg-[#8cc63f]";

            return (
              <div
                key={job.id || job._id}
                onClick={() => router.push("/jobs")}
                className={`relative group flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 transition-all duration-150 cursor-pointer hover:bg-slate-50/80 ${
                  job.highlighted
                    ? "border-l-4 border-l-[#8cc63f]"
                    : "border-l-4 border-l-transparent hover:border-l-[#8cc63f]"
                }`}
              >
                <div className="flex items-center space-x-6 w-full md:w-auto mb-4 md:mb-0">
                  <div className="w-24 h-16 flex items-center justify-center p-2 flex-shrink-0">
                    <img
                      src={job.logo || "https://via.placeholder.com/80"}
                      alt={job.company || "Company"}
                      className="max-h-12 max-w-full object-contain"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800 group-hover:text-[#8cc63f] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-slate-400 text-sm font-normal mt-0.5">
                      {job.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-6 md:space-x-12 w-full md:w-auto">
                  <div className="flex items-center text-slate-400 text-sm">
                    <svg
                      className="w-4 h-4 mr-1.5 fill-current text-slate-400"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{job.location}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold text-white tracking-wide shadow-xs ${
                      job.typeColor || badgeBg
                    }`}
                  >
                    {job.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 4. LOOKING FOR A JOB? BANNER SECTION ================= */}
      <section className="bg-[#8cc63f] py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Looking For A Job?
            </h2>
            <p className="text-white/90 text-sm md:text-base font-normal max-w-xl">
              Join ZESTHIRE today to unlock professional opportunities and advance your career path.
            </p>
          </div>
          <div>
            <button
              onClick={() => router.push("/signup/jobseeker")}
              className="bg-[#ffeb3b] hover:bg-[#fdd835] text-slate-900 font-bold px-8 py-3.5 rounded shadow-md transition cursor-pointer text-sm tracking-wide"
            >
              Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* ================= 5. COMPANY WE'VE HELPED SECTION ================= */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Company We've Helped
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto mb-16 font-normal leading-relaxed">
            Trusted by world-class organizations to build exceptional engineering and creative teams.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-16 items-center justify-items-center">
            {companyLogos.map((comp) => (
              <div key={comp.name} className="flex items-center justify-center p-4 w-full h-16">
                <img
                  src={comp.logo}
                  alt={comp.name}
                  className="max-h-12 max-w-[140px] object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition duration-300 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}