"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import { useConversation } from "@/lib/queries/conversations";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { memo, useEffect, useRef } from "react";
import { MessageItem } from "./message-item";
import { LoadingDots } from "./ui/loading-dots";

const MemoizedMessageItem = memo(MessageItem);

export function MessagesList({
  initialConversation,
  id,
}: {
  initialConversation?: any;
  id: string;
}) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, status, setMessages, setModelId, setInput, reload } =
    useChatContext();
  const { data: conversation } = useConversation(id, initialConversation);
  const hasReloaded = useRef(false);
  const lastMessageIndex = messages.length - 1;

  useEffect(() => {
    if (!conversation) {
      router.push("/chat");
    }
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }

    if (conversation?.model) {
      setModelId(conversation.model);
    }
  }, [conversation, setMessages, setModelId]);

  useEffect(() => {
    if (!hasReloaded.current && messages.length === 1) {
      hasReloaded.current = true;
      setInput("");
      reload({ body: { firstMessage: true } });
    }
  }, [messages.length, reload]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [conversation?.messages.length]);

  const memoizedConversationMessages = useMemo(() => {
    return conversation?.messages?.map((message: any) => (
      <MemoizedMessageItem key={message.id} message={message} />
    ));
  }, [conversation?.messages]);

  const memoizedLastMessage = useMemo(() => {
    if (
      messages?.length > 0 &&
      messages[lastMessageIndex].role === "assistant" &&
      status !== "ready"
    ) {
      return <MemoizedMessageItem message={messages[lastMessageIndex]} />;
    }
    return null;
  }, [messages, lastMessageIndex, status]);

  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-4 px-2 pt-8">
      {memoizedConversationMessages}
      {memoizedLastMessage}
      {status === "submitted" && <LoadingDots className="text-muted-foreground" />}
      <div ref={messagesEndRef} />
    </div>
  );
}
