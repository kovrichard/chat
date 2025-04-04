"use client";

import { MessageContent } from "@/components/message-content";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loading-dots";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatContext } from "@/lib/contexts/chat-context";
import { useConversation } from "@/lib/queries/conversations";
import { useModelStore } from "@/lib/stores/model-store";
import { cn } from "@/lib/utils";
import { Message } from "ai";
import { RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Memoized message component to prevent unnecessary rerenders
const MessageItem = memo(({ message }: { message: Message }) => (
  <div
    className={cn(
      "flex flex-col gap-1 group",
      message.role === "user" ? "ml-auto max-w-[60%] items-end" : "mr-auto max-w-full"
    )}
  >
    <MessageContent message={message} />
    <div className="flex flex-col items-start gap-1 text-muted-foreground">
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 p-0">
              <RefreshCw
                size={18}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p>Regenerate response</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
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
      <div className="flex flex-col max-w-5xl mx-auto gap-4 px-2">
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
    <ScrollArea
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="relative h-[calc(100svh-1rem-110px)]"
    >
      <div className="absolute top-0 left-0 right-0 max-w-5xl mx-auto h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
      {messagesList}
      <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </ScrollArea>
  );
}
