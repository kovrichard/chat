"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatAction, ChatState, Conversation, Message } from "../types/chat";
import { chatReducer, initialChatState } from "./chatReducer";

interface ChatContextType {
  state: ChatState;
  addMessage: (content: string, role: "user" | "assistant") => void;
  createConversation: (title: string) => void;
  selectConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  const addMessage = (content: string, role: "user" | "assistant") => {
    if (!state.selectedConversationId) return;

    const message: Message = {
      id: uuidv4(),
      content,
      role,
      timestamp: Date.now(),
    };

    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        conversationId: state.selectedConversationId,
        message,
      },
    });
  };

  const createConversation = (title: string) => {
    const conversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dispatch({
      type: "CREATE_CONVERSATION",
      payload: { conversation },
    });
  };

  const selectConversation = (conversationId: string) => {
    dispatch({
      type: "SELECT_CONVERSATION",
      payload: { conversationId },
    });
  };

  const deleteConversation = (conversationId: string) => {
    dispatch({
      type: "DELETE_CONVERSATION",
      payload: { conversationId },
    });
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        addMessage,
        createConversation,
        selectConversation,
        deleteConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatStore() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatStore must be used within a ChatProvider");
  }
  return context;
}
