"use client";

import InputForm from "@/components/input-form";
import { MessageContent } from "@/components/message-content";
import { LoadingDots } from "@/components/ui/loading-dots";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/ChatContext";
import { useChat } from "@ai-sdk/react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const { state, addMessage, setConversationTitle } = useChatStore();
  const conversation = state.conversations.find((c) => c.id === conversationId);
  const isNewConversation = conversation?.messages.length === 1;
  const initialMessage = conversation?.messages[0] || "";

  const { messages, input, setInput, handleInputChange, handleSubmit, status, stop } =
    useChat({
      id: conversationId,
      initialMessages: isNewConversation ? [] : conversation?.messages || [],
      onFinish: (message) => {
        addMessage(message.content, "assistant");

        if (isNewConversation) {
          const titleMessages = [conversation.messages[0], message];

          fetch("/api/title", {
            method: "POST",
            body: JSON.stringify({ messages: titleMessages }),
          })
            .then((res) => res.text())
            .then((text) => {
              setConversationTitle(conversationId, text);
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
    if (initialMessage && !initialMessageSent.current && isNewConversation) {
      console.log("initialMessage", initialMessage);
      console.log("isNewConversation", isNewConversation);
      setInput(initialMessage.content);
      initialMessageSent.current = true;
    }
  }, [initialMessage, isNewConversation]);

  useEffect(() => {
    if (isNewConversation) {
      handleSubmit();
    }
  }, [isNewConversation, initialMessageSent.current]);

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

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addMessage(input, "user");
    handleSubmit(e);
    setUserScrolled(false); // Reset user scroll when sending a new message
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addMessage(input, "user");
      handleSubmit(e as any);
      setUserScrolled(false); // Reset user scroll when sending a new message
    }
  };

  useEffect(() => {
    if (!conversation) {
      router.push("/chat");
    }
  }, [conversation, router]);

  return (
    <div className="flex flex-col h-screen min-w-[320px]">
      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-auto p-4 space-y-4"
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
              <MessageContent content={message.content} role={message.role} />
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
