"use client";

import { useChat } from "@ai-sdk/react";
import { QueryClient } from "@tanstack/react-query";
import { Message } from "ai";
import React, { createContext, useContext, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAddMessage } from "../queries/conversations";
import { useUpdateConversationTitle } from "../queries/conversations";
import { useModelStore } from "../stores/model-store";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

interface ChatContextType {
  messages: Message[];
  input: string;
  setMessages: (messages: Message[]) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: ChatStatus;
  stop: () => void;
  reload: (options?: { body?: Record<string, any> }) => void;
  setInput: (input: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({
  children,
  id = uuidv4(),
  initialMessages = [],
}: {
  children: ReactNode;
  id?: string;
  initialMessages?: Message[];
}) {
  const queryClient = new QueryClient();
  const updateTitle = useUpdateConversationTitle();
  const addMessage = useAddMessage();
  const { model } = useModelStore();

  const {
    messages,
    input,
    setMessages,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    reload,
    setInput,
  } = useChat({
    id,
    initialMessages,
    body: { model: model.id },
    onFinish: (message: Message) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });

      addMessage.mutateAsync({
        message,
        conversationId: id,
      });

      if (messages.length === 1) {
        const titleMessages = [messages[0], message];

        fetch("/api/title", {
          method: "POST",
          body: JSON.stringify({ messages: titleMessages }),
        })
          .then((res) => res.text())
          .then((title) => {
            updateTitle.mutateAsync({ conversationId: id, title });
          });
      }
    },
  });

  return (
    <ChatContext.Provider
      value={{
        messages,
        input,
        setMessages,
        handleInputChange,
        handleSubmit,
        status,
        stop,
        reload,
        setInput,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
