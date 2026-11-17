export const dynamic = "force-dynamic";
import CompanyDetailClient from "./CompanyDetailClient";

export default async function CompanyDetailPage({ params }) {
  const resolvedParams = await params;

  return (
    <CompanyDetailClient companyId={resolvedParams?.id} />
  );
}
