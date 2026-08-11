import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

await prisma.business.update({
  where: { instagramPageId: "test_page_456" },
  data: { notifyEmails: [process.env.SMTP_USER || "your-email@gmail.com"] },
});

console.log("Updated notifyEmails");
await prisma.$disconnect();
