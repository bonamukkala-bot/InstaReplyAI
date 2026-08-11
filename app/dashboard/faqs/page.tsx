import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FAQEditor } from "@/components/dashboard/FAQEditor";

export default async function FAQsPage() {
  const session = await auth();
  const businessId = (session?.user as any)?.businessId as string | undefined;
  if (!businessId) redirect("/login");

  const faqs = await prisma.fAQ.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  return <FAQEditor initialFaqs={faqs} />;
}
