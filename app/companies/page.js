import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  ChevronLeft,
} from "lucide-react";
import Navbar from "../components/Navbar";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getCompanies() {
  try {
    const res = await fetch(`${API_URL}/api/jobs/employers`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();

    return Array.isArray(data)
      ? data
      : data.employers || data.companies || data.users || data.data || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Companies
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Discover companies and explore their open positions.
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h2 className="font-bold text-slate-800">
              No companies found
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => {
              const companyId = company?._id || company?.id;
              const companyName =
                company?.companyName || company?.name || "Company";

              return (
                <div
                  key={companyId}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#8cc63f] flex items-center justify-center font-bold text-xl">
                      {companyName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        {companyName}
                      </h2>
                      <p className="text-xs text-[#8cc63f]">
                        {company?.industry || "Technology & Services"}
                      </p>
                    </div>
                  </div>

                  {company?.location && (
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {company.location}
                    </p>
                  )}

                  {company?.email && (
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {company.email}
                    </p>
                  )}

                  {company?.companyWebsite && (
                    <p className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">
                        {company.companyWebsite}
                      </span>
                    </p>
                  )}

                  <Link
                    href={`/companies/${companyId}`}
                    className="block text-center mt-4 px-4 py-3 bg-[#8cc63f] hover:bg-[#7cb342] text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    View Company
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}