import { prisma } from "@/lib/db/prisma";

export async function markHandoff(
  conversationId: string,
  reason: "ESCALATION_KEYWORD" | "LOW_CONFIDENCE"
) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: "WAITING_HUMAN",
      handoffAt: new Date(),
    },
  });
  console.log(`Conversation ${conversationId} marked WAITING_HUMAN (${reason})`);
}
