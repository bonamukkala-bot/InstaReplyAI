import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = "owner@testsalon.com";
const plainPassword = "password123";

const hashed = await bcrypt.hash(plainPassword, 10);

const business = await prisma.business.findUnique({
  where: { instagramPageId: "test_page_456" },
});

const user = await prisma.user.upsert({
  where: { email },
  update: {},
  create: {
    email,
    name: "Test Owner",
    password: hashed,
    role: "OWNER",
    businessId: business.id,
  },
});

console.log("Created user:", user.email, "| password:", plainPassword);
await prisma.$disconnect();
