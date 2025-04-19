"use client";

import { useModelStore } from "@/stores/model-store";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "ai";
import { useParams } from "next/navigation";
import React, { createContext, useContext, ReactNode, useEffect, useRef } from "react";
import { conversationKeys, useAddMessage } from "../queries/conversations";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

interface ChatContextType {
  id: string;
  messages: Message[];
  setInput: (input: string) => void;
  status: ChatStatus;
  error?: Error;
  stop: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const conversationId = params.id as string;
  const queryClient = useQueryClient();
  const addMessage = useAddMessage();
  const { model } = useModelStore();
  const sentRef = useRef(false);

  const { id, messages, status, input, setInput, handleSubmit, error, stop } = useChat({
    id: conversationId,
    experimental_prepareRequestBody: ({ messages, id }) => {
      return { message: messages[messages.length - 1], id, model: model.id };
    },
    sendExtraMessageFields: true,
    onFinish: async (message: Message) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      await addMessage.mutateAsync({
        message,
        conversationId,
      });
      const conversation = queryClient.getQueryData<{
        id: string;
        model: string;
        title: string;
        messages: Message[];
      }>(conversationKeys.detail(conversationId));

      if (conversation?.title === "New Chat") {
        queryClient.invalidateQueries({
          queryKey: conversationKeys.list(),
        });
      }
    },
  });

  useEffect(() => {
    if (status === "ready" && input && conversationId && !sentRef.current) {
      sentRef.current = true;
      handleSubmit();
    }

    if (!input) {
      sentRef.current = false;
    }
  }, [status, input, handleSubmit, conversationId]);

  return (
    <ChatContext.Provider
      value={{
        id,
        messages,
        setInput,
        status,
        error,
        stop,
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
