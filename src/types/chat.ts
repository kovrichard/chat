import { Conversation, Message } from "@prisma/client";
import { UIMessage } from "ai";

export type PartialConversation = Omit<
  Conversation & { messages: UIMessage[] },
  "userId" | "createdAt" | "updatedAt" | "locked"
>;
