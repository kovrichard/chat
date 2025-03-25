"use client";

import { saveConversation, saveConversationTitle } from "@/lib/actions/conversations";
import { saveMessage } from "@/lib/actions/messages";
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatState, PartialConversation, PartialMessage } from "../types/chat";
import { chatReducer, initialChatState } from "./chatReducer";

interface ChatContextType {
  state: ChatState;
  addMessage: (content: string, role: "user" | "assistant") => Promise<void>;
  createConversation: (title: string, firstMessage?: string) => Promise<string>;
  setConversationTitle: (conversationId: string, title: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  const addMessage = async (content: string, role: "user" | "assistant") => {
    if (!state.selectedConversationId) return;

    const message: PartialMessage = {
      id: uuidv4(),
      content,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveMessage(message, state.selectedConversationId);

    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        conversationId: state.selectedConversationId,
        message,
      },
    });
  };

  const createConversation = async (title: string, firstMessage?: string) => {
    const id = uuidv4();
    const conversation: PartialConversation = {
      id,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (firstMessage) {
      conversation.messages.push({
        id: uuidv4(),
        content: firstMessage,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await saveConversation(conversation);

    dispatch({
      type: "CREATE_CONVERSATION",
      payload: { conversation },
    });

    return id;
  };

  const setConversationTitle = async (conversationId: string, title: string) => {
    await saveConversationTitle(conversationId, title);

    dispatch({
      type: "SET_CONVERSATION_TITLE",
      payload: { conversationId, title },
    });
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        addMessage,
        createConversation,
        setConversationTitle,
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
