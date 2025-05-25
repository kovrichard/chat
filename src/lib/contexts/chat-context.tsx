"use client";

import { useFileStore } from "@/stores/file-store";
import { useModelStore } from "@/stores/model-store";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "ai";
import { useParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { conversationKeys, useAddMessage } from "../queries/conversations";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

interface ChatContextType {
  id: string;
  messages: Message[];
  setInput: (input: string) => void;
  status: ChatStatus;
  error?: Error;
  stop: () => void;
  emptySubmit: () => void;
  browse: boolean;
  setBrowse: (browse: boolean) => void;
  academic: boolean;
  setAcademic: (academic: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const [stableId] = useState(() => uuidv4()); // Generate once and keep it stable
  const conversationId = (params.id as string) || stableId;
  const conversationIdRef = useRef(conversationId);
  const queryClient = useQueryClient();
  const addMessage = useAddMessage();
  const { model, temporaryChat } = useModelStore();
  const sentRef = useRef(false);
  const { files, setFiles } = useFileStore();
  const [browse, setBrowse] = useState(false);
  const [academic, setAcademic] = useState(false);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const { id, messages, status, input, setInput, handleSubmit, error, stop } = useChat({
    api: temporaryChat ? "/api/chat/temp" : "/api/chat",
    id: conversationIdRef.current,
    experimental_prepareRequestBody: ({ messages, id }) => {
      return {
        message: messages[messages.length - 1],
        messages: temporaryChat ? messages : null,
        id,
        model: model.id,
        temporaryChat,
        browse,
        academic,
      };
    },
    sendExtraMessageFields: true,
    generateId: () => uuidv4(),
    onFinish: async (message: Message) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      await addMessage.mutateAsync({
        message,
        conversationId: conversationIdRef.current,
      });
      const conversation = queryClient.getQueryData<{
        id: string;
        model: string;
        title: string;
        messages: Message[];
      }>(conversationKeys.details(conversationIdRef.current));

      if (conversation?.title === "New Chat") {
        queryClient.invalidateQueries({
          queryKey: conversationKeys.list(),
        });
      }
    },
  });

  useEffect(() => {
    if (status === "ready" && input && conversationIdRef.current && !sentRef.current) {
      sentRef.current = true;
      handleSubmit(new Event("submit"), {
        experimental_attachments: files,
      });
      setFiles(undefined);
    }

    if (!input) {
      sentRef.current = false;
    }
  }, [status, input, handleSubmit, conversationIdRef.current]);

  function emptySubmit() {
    handleSubmit(new Event("submit"), {
      allowEmptySubmit: true,
    });
    setFiles(undefined);
  }

  return (
    <ChatContext.Provider
      value={{
        id,
        messages,
        setInput,
        status,
        error,
        stop,
        emptySubmit,
        browse,
        setBrowse,
        academic,
        setAcademic,
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
