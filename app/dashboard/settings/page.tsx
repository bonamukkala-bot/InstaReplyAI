import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const businessId = (session.user as any).businessId as string | undefined;
  if (!businessId) redirect("/login");

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) redirect("/login");

  return <SettingsForm business={business} />;
}
