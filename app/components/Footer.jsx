'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-12 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* BRANDING LOGO & TAGLINE */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex flex-col justify-center group select-none">
              <div className="flex items-center text-2xl font-black tracking-tight leading-none text-white">
                Z
                <span className="relative inline-block">
                  E
                  {/* Green Leaf Accent */}
                  <svg
                    className="w-3 h-3 text-[#8cc63f] absolute -top-1 left-0 transform -rotate-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.0001 3C17.0001 3 13.0001 4 10.0001 8C7.00012 12 7.00012 16 7.00012 16C7.00012 16 11.0001 16 15.0001 12C19.0001 8 17.0001 3 17.0001 3Z" />
                  </svg>
                </span>
                ST
                <span className="text-[#8cc63f]">HIRE</span>
              </div>
              <span className="text-[10.5px] font-semibold tracking-wide text-slate-400 mt-1">
                Your Next Opportunity Awaits
              </span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Connecting talented professionals with top-tier employers worldwide. Find your dream job or hire the best talent with our seamless platform.
            </p>
          </div>

          {/* FOR CANDIDATES */}
          <div>
            <h3 className="text-[#8cc63f] font-semibold text-sm uppercase tracking-wider mb-4">For Candidates</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/jobs-list" className="hover:text-[#8cc63f] transition-colors">Find Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-[#8cc63f] transition-colors">Companies</Link></li>
              <li><Link href="/jobseeker/saved-jobs" className="hover:text-[#8cc63f] transition-colors">Saved Jobs</Link></li>
            </ul>
          </div>

          {/* FOR EMPLOYERS */}
          <div>
            <h3 className="text-[#8cc63f] font-semibold text-sm uppercase tracking-wider mb-4">For Employers</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/employer/post-job" className="hover:text-[#8cc63f] transition-colors">Post a Job</Link></li>
              <li><Link href="/employer/dashboard" className="hover:text-[#8cc63f] transition-colors">Employer Dashboard</Link></li>
              <li><Link href="/employer/manage-jobs" className="hover:text-[#8cc63f] transition-colors">Manage Jobs</Link></li>
            </ul>
          </div>

          {/* STAY UPDATED */}
          <div>
            <h3 className="text-[#8cc63f] font-semibold text-sm uppercase tracking-wider mb-4">Stay Updated</h3>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-[#8cc63f]"
              />
              <button 
                type="submit" 
                className="w-full bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-sm py-2 px-4 rounded transition-colors cursor-pointer shadow-sm"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>&copy; {currentYear} ZESTHIRE. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-gray-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}