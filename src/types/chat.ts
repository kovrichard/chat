import { Conversation, Message } from "@prisma/client";

type PartialMessage = Omit<Message, "conversationId" | "createdAt" | "updatedAt">;

export type PartialConversation = Omit<
  Conversation & { messages: PartialMessage[] },
  "userId" | "createdAt" | "updatedAt"
>;
