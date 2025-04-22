import { Conversation } from "@/lib/prisma/client";
import { UIMessage } from "ai";

export type PartialConversation = Omit<
  Conversation & { messages: UIMessage[] },
  "userId" | "createdAt" | "updatedAt" | "locked"
>;
