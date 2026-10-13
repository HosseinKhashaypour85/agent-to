import { redirect } from "next/navigation";

export default async function LegacyPersianPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "login") redirect("/customer-login");
  redirect(`/${slug}`);
}
