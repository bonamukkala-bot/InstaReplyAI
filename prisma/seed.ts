import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.upsert({
    where: { instagramPageId: "test_page_456" },
    update: {},
    create: {
      name: "Test Salon",
      instagramPageId: "test_page_456",
      accessToken: "fake_token_for_now",
      hours: {
        mon: "9:00-18:00",
        tue: "9:00-18:00",
        wed: "9:00-18:00",
        thu: "9:00-18:00",
        fri: "9:00-18:00",
        sat: "10:00-16:00",
        sun: "closed",
      },
      tone: "friendly",
      notifyEmails: [],
      services: [
        { name: "Haircut", price: "Rs 300" },
        { name: "Facial", price: "Rs 800" },
      ],
      faqs: {
        create: [
          {
            question: "What are your hours?",
            answer: "We're open 9am-6pm Mon-Fri, 10am-4pm Saturday, closed Sunday!",
            keywords: ["hours", "open", "timing", "when are you open"],
          },
        ],
      },
    },
  });

  console.log("Seeded business:", business.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
