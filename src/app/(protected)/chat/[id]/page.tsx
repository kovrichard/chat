"use client";

import InputForm from "@/components/input-form";
import { MessageContent } from "@/components/message-content";
import { LoadingDots } from "@/components/ui/loading-dots";
import { useChatContext } from "@/lib/contexts/chat-context";
import { useAddMessage, useConversation } from "@/lib/queries/conversations";
import { useModelStore } from "@/lib/stores/model-store";
import { cn } from "@/lib/utils";
import { Message } from "ai";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Memoized message component to prevent unnecessary rerenders
const MessageItem = memo(({ message }: { message: Message }) => (
  <div
    className={cn(
      "mb-4",
      message.role === "user" ? "ml-auto max-w-[60%]" : "mr-auto max-w-full w-full"
    )}
  >
    <MessageContent message={message} />
  </div>
));

MessageItem.displayName = "MessageItem";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const { data: conversation, isLoading } = useConversation(conversationId);
  const { setModel } = useModelStore();

  const { messages, status, reload, setMessages, setInput } = useChatContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const hasReloaded = useRef(false);

  // Handle initial message if present
  useEffect(() => {
    if (!hasReloaded.current && messages.length === 1) {
      hasReloaded.current = true;
      setInput("");
      reload({ body: { firstMessage: true } });
    }
  }, [messages.length, reload]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;

    setUserScrolled(!isScrolledToBottom);
  }, []);

  useEffect(() => {
    if (!userScrolled) {
      scrollToBottom();
    }
  }, [messages, userScrolled, scrollToBottom]);

  useEffect(() => {
    if (!isLoading && !conversation) {
      router.push("/chat");
    }

    if (conversation?.model) {
      setModel(conversation.model);
    }

    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation, isLoading, router, setModel, setMessages]);

  // Memoize the messages list to prevent unnecessary rerenders
  const messagesList = useMemo(
    () => (
      <div className="flex flex-col max-w-5xl mx-auto">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {status === "submitted" && <LoadingDots className="text-muted-foreground" />}
        <div ref={messagesEndRef} />
      </div>
    ),
    [messages, status]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-svh">
        <div className="flex gap-2">
          <div className="size-4 bg-muted rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="size-4 bg-muted rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="size-4 bg-muted rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-svh min-w-[320px]">
      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messagesList}
      </div>

      {/* Input Form */}
      <InputForm />
    </div>
  );
}
