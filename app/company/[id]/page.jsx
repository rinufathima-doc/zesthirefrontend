import CompanyDetailClient from "./CompanyDetailClient";

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <CompanyDetailClient companyId={resolvedParams.id} />;
}