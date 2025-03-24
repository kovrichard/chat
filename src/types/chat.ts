export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatState {
  conversations: Conversation[];
  selectedConversationId: string | null;
}

export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: { conversationId: string; message: Message } }
  | { type: "CREATE_CONVERSATION"; payload: { conversation: Conversation } }
  | { type: "SET_CONVERSATION_TITLE"; payload: { conversationId: string; title: string } }
  | { type: "SELECT_CONVERSATION"; payload: { conversationId: string } }
  | { type: "DELETE_CONVERSATION"; payload: { conversationId: string } };
