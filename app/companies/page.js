
import CompanyDetailClient from "./CompanyDetailClient";

export default async function CompanyDetailPage({ params }) {
  const resolvedParams = await params;
  const companyId = resolvedParams?.id;

  return <CompanyDetailClient companyId={companyId} />;
}
