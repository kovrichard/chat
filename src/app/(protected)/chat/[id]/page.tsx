"use client";

import InputForm from "@/components/input-form";
import { MessageContent } from "@/components/message-content";
import { LoadingDots } from "@/components/ui/loading-dots";
import {
  useAddMessage,
  useConversation,
  useUpdateConversationTitle,
} from "@/lib/queries/conversations";
import { useModelStore } from "@/lib/stores/model-store";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const { data: conversation, isLoading } = useConversation(conversationId);
  const isNewConversation = conversation?.messages?.length === 1;
  const initialMessage = conversation?.messages?.[0];
  const updateTitle = useUpdateConversationTitle();
  const addMessage = useAddMessage();
  const { model, setModel } = useModelStore();

  const { messages, input, setInput, handleInputChange, handleSubmit, status, stop } =
    useChat({
      id: conversationId,
      initialMessages: isNewConversation ? [] : conversation?.messages || [],
      body: {
        model,
        conversationId,
      },
      onFinish: (message) => {
        addMessage.mutateAsync({
          message: {
            ...message,
            reasoning:
              message.parts?.[0]?.type === "reasoning"
                ? message.parts[0].reasoning
                : undefined,
          },
          conversationId,
        });

        if (isNewConversation) {
          const titleMessages = [initialMessage, message];

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const initialMessageSent = useRef(false);

  // Handle initial message if present
  useEffect(() => {
    if (!initialMessageSent.current && isNewConversation) {
      setInput(initialMessage.content);
      initialMessageSent.current = true;
    }
  }, [isNewConversation, setInput]);

  useEffect(() => {
    if (isNewConversation && initialMessageSent.current) {
      handleSubmit();
    }
  }, [isNewConversation, initialMessageSent.current, handleSubmit]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;

    setUserScrolled(!isScrolledToBottom);
  };

  useEffect(() => {
    if (!userScrolled) {
      scrollToBottom();
    }
  }, [messages, userScrolled]);

  const handleSendMessage = async (
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    await addMessage.mutateAsync({
      message: {
        id: uuidv4(),
        content: input,
        role: "user",
      },
      conversationId,
    });
    handleSubmit(e);
    setUserScrolled(false);
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  useEffect(() => {
    if (!isLoading && !conversation) {
      router.push("/chat");
    }

    if (conversation?.model) {
      setModel(conversation.model);
    }
  }, [conversation, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen min-w-[320px]">
      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div className="flex flex-col max-w-5xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "mb-4",
                message.role === "user"
                  ? "ml-auto max-w-[60%]"
                  : "mr-auto max-w-full w-full"
              )}
            >
              <MessageContent message={message} />
            </div>
          ))}
          {status === "submitted" && <LoadingDots className="text-muted-foreground" />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <InputForm
        input={input}
        handleChange={handleInputChange}
        handleSubmit={handleSendMessage}
        handleKeyDown={handleKeyDown}
        status={status}
        handleStop={stop}
      />
    </div>
  );
}
