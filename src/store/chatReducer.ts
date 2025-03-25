import { ChatAction, ChatState } from "../types/chat";

export const initialChatState: ChatState = {
  conversations: [],
  selectedConversationId: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE": {
      const { conversationId, message } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, message],
                updatedAt: new Date(),
              }
            : conv
        ),
      };
    }

    case "CREATE_CONVERSATION": {
      return {
        ...state,
        conversations: [...state.conversations, action.payload.conversation],
        selectedConversationId: action.payload.conversation.id,
      };
    }

    case "SET_CONVERSATION_TITLE": {
      const { conversationId, title } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, title } : conv
        ),
      };
    }

    case "SELECT_CONVERSATION": {
      return {
        ...state,
        selectedConversationId: action.payload.conversationId,
      };
    }

    case "DELETE_CONVERSATION": {
      const { conversationId } = action.payload;
      const newConversations = state.conversations.filter(
        (conv) => conv.id !== conversationId
      );
      return {
        ...state,
        conversations: newConversations,
        selectedConversationId:
          state.selectedConversationId === conversationId
            ? newConversations[0]?.id ?? null
            : state.selectedConversationId,
      };
    }

    default:
      return state;
  }
}
