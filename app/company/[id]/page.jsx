
import CompanyDetailClient from "./CompanyDetailClient";

export default async function CompanyDetailPage({ params }) {
  const { id } = await params;

  return <CompanyDetailClient companyId={id} />;
}
