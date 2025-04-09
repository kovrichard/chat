"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "ai";
import { useParams, useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { getModel } from "../providers";
import { Model } from "../providers";
import { useAddMessage, useConversation } from "../queries/conversations";
import { useUpdateConversationTitle } from "../queries/conversations";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

interface ChatContextType {
  id: string;
  messages: Message[];
  input: string;
  model: Model;
  setModelId: (modelId: string) => void;
  setMessages: (messages: Message[]) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: ChatStatus;
  stop: () => void;
  reload: (options?: { body?: Record<string, any> }) => void;
  setInput: (input: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const conversationId = useMemo(() => (params.id as string) || uuidv4(), [params.id]);
  const queryClient = useQueryClient();
  const updateTitle = useUpdateConversationTitle();
  const addMessage = useAddMessage();
  const [model, setModel] = useState<Model>(getModel("4o-mini") as Model);
  const [modelId, setModelId] = useState<string>("4o-mini");
  const { data: conversation, isLoading } = useConversation(conversationId);

  const {
    id,
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
    id: conversationId,
    initialMessages: conversation?.messages,
    body: { model: model.id },
    onFinish: (message: Message) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });

      addMessage.mutateAsync({
        message,
        conversationId,
      });

      if (messages.length === 1) {
        const titleMessages = [messages[0], message];

        fetch("/api/title", {
          method: "POST",
          body: JSON.stringify({ messages: titleMessages }),
        })
          .then((res) => res.text())
          .then((title) => {
            updateTitle.mutateAsync({ conversationId, title });
          });
      }
    },
  });

  useEffect(() => {
    setModel(getModel(modelId) as Model);
  }, [modelId]);

  useEffect(() => {
    if (!isLoading && !conversation) {
      router.push("/chat");
    }

    if (conversation?.messages) {
      setMessages(conversation.messages);
    }

    if (conversation?.model) {
      setModelId(conversation.model);
    }
  }, [conversation, isLoading, router]);

  return (
    <ChatContext.Provider
      value={{
        id,
        messages,
        input,
        model,
        setModelId,
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
