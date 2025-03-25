import { Conversation, Message } from "@prisma/client";

export type MessageRole = "user" | "assistant" | "system" | "data";
export type PartialMessage = Omit<Message, "role" | "conversationId"> & {
  role: MessageRole;
};
export type PartialConversation = Omit<
  Conversation & { messages: PartialMessage[] },
  "userId"
>;

export interface ChatState {
  conversations: PartialConversation[];
  selectedConversationId: string | null;
}

export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: { conversationId: string; message: PartialMessage } }
  | { type: "CREATE_CONVERSATION"; payload: { conversation: PartialConversation } }
  | {
      type: "SET_CONVERSATION_TITLE";
      payload: { conversationId: string; title: string };
    };
