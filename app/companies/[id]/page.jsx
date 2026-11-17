import Link from "next/link";
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  ChevronLeft,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getCompanyData(id) {
  try {
    const res = await fetch(
      `${API_URL}/api/jobs/company/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error("Company API error:", res.status);
      return null;
    }

    const data = await res.json();

    return (
      data.employer ||
      data.company ||
      data.user ||
      data.data ||
      data
    );
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}

async function getAllJobs(companyId) {
  try {
    const res = await fetch(`${API_URL}/api/jobs`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const jobsData = await res.json();

    const jobList = Array.isArray(jobsData)
      ? jobsData
      : jobsData?.jobs || [];

    return jobList.filter((job) => {
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

      return (
        empRef?.toString() === companyId?.toString()
      );
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export default async function CompanyDetailPage({ params }) {
  const { id: companyId } = await params;

  if (!companyId) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center text-slate-500 text-sm">
        Company ID is missing.
      </div>
    );
  }

  const company = await getCompanyData(companyId);
  const companyJobs = await getAllJobs(companyId);

  if (!company || typeof company !== "object" || Object.keys(company).length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] text-slate-800 pb-20">
        <Navbar />

        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 p-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Company Not Found
          </h1>

          <p className="text-sm text-slate-500">
            Could not retrieve details for ID: {companyId}
          </p>

          <Link
            href="/companies"
            className="px-5 py-2.5 bg-[#8cc63f] text-slate-950 font-bold text-xs rounded-xl shadow"
          >
            Back to Companies Directory
          </Link>
        </div>
      </div>
    );
  }

  const companyName =
    company?.companyName || company?.name || "Company Profile";

  const initialLetter = companyName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 pb-20">
      <Navbar />

      {/* Company Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-8 space-y-4">
        <Link
          href="/companies"
          className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition"
        >
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

      {/* Company Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Company Details */}
        <div className="space-y-6 md:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">

            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Company Details
            </h3>

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

                  <a
                    href={company.companyWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#8cc63f] hover:underline truncate"
                  >
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
        </div>

        {/* About and Jobs */}
        <div className="md:col-span-2 space-y-6">

          {/* About Company */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              About the Company
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {company?.bio ||
                company?.description ||
                "No description provided by this company yet."}
            </p>
          </div>

          {/* Open Positions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">

            <h3 className="text-base font-bold text-slate-900">
              Open Positions ({companyJobs.length})
            </h3>

            {companyJobs.length === 0 ? (
              <p className="text-xs text-slate-400">
                No active job openings at the moment.
              </p>
            ) : (
              <div className="space-y-3">

                {companyJobs.map((job) => {
                  const jobId = job?._id || job?.id;

                  return (
                    <div
                      key={jobId}
                      className="p-4 border border-slate-100 hover:border-slate-200 rounded-2xl flex items-center justify-between transition bg-slate-50/50"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {job?.title || "Position"}
                        </h4>

                        <p className="text-xs text-slate-500">
                          {job?.location || "Remote"} •{" "}
                          {job?.jobType || job?.type || "Full Time"}
                        </p>
                      </div>

                      {jobId && (
                        <Link
                          href={`/jobseeker/apply/${jobId}`}
                          className="px-4 py-2 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer transition"
                        >
                          Apply
                        </Link>
                      )}
                    </div>
                  );
                })}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}