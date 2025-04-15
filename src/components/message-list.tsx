"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import { useConversation } from "@/lib/queries/conversations";
import { useRouter } from "next/navigation";
import { memo, useEffect, useMemo } from "react";
import LastMessage from "./last-message";
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
  const { status, setMessages, setModelId } = useChatContext();
  const { data: conversation } = useConversation(id, initialConversation);

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

  const memoizedConversationMessages = useMemo(() => {
    return conversation?.messages?.map((message: any) => (
      <MemoizedMessageItem key={message.id} message={message} />
    ));
  }, [conversation?.messages]);

  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-4 px-4 sm:px-8 pt-8">
      {memoizedConversationMessages}
      <LastMessage />
      {status === "submitted" && <LoadingDots className="text-muted-foreground" />}
      <div id="messages-end" />
    </div>
  );
}
