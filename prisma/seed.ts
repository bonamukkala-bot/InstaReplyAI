import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.upsert({
    where: { instagramPageId: "test_page_456" },
    update: {},
    create: {
      name: "Charan Solutions",
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
      tone: "professional and friendly",
      notifyEmails: ["bonamukkalacharan@gmail.com"],
      services: [
        { name: "Web Development", price: "" },
        { name: "Full-Stack Applications", price: "" },
        { name: "Automation & Workflows", price: "" },
      ],
      faqs: {
        create: [
          {
            question: "What are your hours?",
            answer: "I'm available for calls and messages during standard business hours (Mon-Fri 9am-6pm, Sat 10am-4pm). Async project work happens anytime!",
            keywords: ["hours", "open", "timing", "when are you open"],
          },
          {
            question: "How much does it cost?",
            answer: "Pricing depends on your project scope. Share a few details about what you need, or reach out on WhatsApp at 9014996929 for an accurate quote.",
            keywords: ["price", "cost", "how much", "pricing", "budget"],
          },
          {
            question: "Can I talk to you directly?",
            answer: "Absolutely! Reach out on WhatsApp at 9014996929 and I'll get back to you as soon as possible.",
            keywords: ["talk", "call", "meet", "contact", "speak"],
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
