"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import { useConversation } from "@/lib/queries/conversations";
import { useRouter } from "next/navigation";
import { memo, useEffect, useMemo } from "react";
import LastMessage from "./last-message";
import { MessageItem } from "./message-item";
import { LoadingDots } from "./ui/loading-dots";

import { useModelStore } from "@/stores/model-store";
const MemoizedMessageItem = memo(MessageItem);

export function MessagesList({
  initialConversation,
  id,
}: {
  initialConversation?: any;
  id: string;
}) {
  const { status, error } = useChatContext();
  const { setModel } = useModelStore();
  const { data: conversation } = useConversation(id, initialConversation);

  useEffect(() => {
    if (conversation?.model) {
      setModel(conversation.model);
    }
  }, [conversation]);

  const memoizedConversationMessages = useMemo(() => {
    return conversation?.messages?.map((message: any) => (
      <MemoizedMessageItem key={message.id} message={message} />
    ));
  }, [conversation?.messages]);

  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-4 px-4 sm:px-8 pt-8">
      {memoizedConversationMessages}
      {error && error.message === "content_filter" && (
        <div className="flex flex-col gap-1">
          <div className="text-destructive p-4 border border-destructive rounded-lg">
            <p>
              Uh oh! This message was a little too spicy. Please try again in a different
              conversation.
            </p>
          </div>
          <span className="h-8" />
        </div>
      )}
      <LastMessage />
      {status === "submitted" && <LoadingDots className="text-muted-foreground" />}
      <div id="messages-end" />
    </div>
  );
}
