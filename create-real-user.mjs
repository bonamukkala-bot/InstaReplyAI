import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = "bonamukkalacharan@gmail.com";
const plainPassword = "InstaReply2026!";

const hashed = await bcrypt.hash(plainPassword, 10);

const business = await prisma.business.findUnique({
  where: { instagramPageId: "test_page_456" },
});

const user = await prisma.user.upsert({
  where: { email },
  update: {},
  create: {
    email,
    name: "Charan",
    password: hashed,
    role: "OWNER",
    businessId: business.id,
  },
});

console.log("Created user:", user.email, "| password:", plainPassword);
await prisma.$disconnect();
