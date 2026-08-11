import { prisma } from "@/lib/db/prisma";

export async function getOrCreateConversation(businessId: string, igUserId: string) {
  return prisma.conversation.upsert({
    where: { businessId_instagramUserId: { businessId, instagramUserId: igUserId } },
    create: {
      businessId,
      instagramUserId: igUserId,
      instagramThreadId: igUserId,
      status: "ACTIVE",
    },
    update: { updatedAt: new Date() },
  });
}
