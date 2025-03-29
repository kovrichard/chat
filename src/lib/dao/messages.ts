import "server-only";

import { getUserFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";

type ReasoningDetail =
  | {
      type: "text";
      text: string;
      signature?: string;
    }
  | {
      type: "redacted";
      data: string;
    };

export type OnFinishResult = {
  text: string;
  reasoning?: string;
  reasoningDetails?: ReasoningDetail[];
};

export async function saveResultAsAssistantMessage(
  result: OnFinishResult,
  conversationId: string
) {
  const reasoning = result.reasoning;
  const signature = result.reasoningDetails?.find(
    (detail) => detail.type === "text"
  )?.signature;
  const content = result.text;

  await saveMessage(content, "assistant", conversationId, reasoning, signature);
}

export async function saveUserMessage(content: string, conversationId: string) {
  await saveMessage(content, "user", conversationId);
}

async function saveMessage(
  content: string,
  role: string,
  conversationId: string,
  reasoning?: string,
  signature?: string
) {
  const user = await getUserFromSession();

  const newMessage = await prisma.message.create({
    data: {
      content,
      role,
      reasoning,
      conversationId,
      signature,
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversationId,
      userId: user.id,
    },
    data: {
      lastMessageAt: new Date(),
    },
  });

  return newMessage;
}
