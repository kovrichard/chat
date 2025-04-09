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
import { useRegenerateMessage } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { Message } from "ai";
import { Copy, RefreshCw } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Memoized message component to prevent unnecessary rerenders
const MessageItem = memo(({ message }: { message: Message }) => {
  const regenerateMessage = useRegenerateMessage();
  const { id, reload } = useChatContext();

  const handleRegenerateMessage = async () => {
    const a = false;
    if (a) {
      await regenerateMessage.mutateAsync({
        messageId: message.id,
        conversationId: id,
      });
      reload({ body: { retry: true } });
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1 group",
        message.role === "user" ? "ml-auto max-w-[60%] items-end" : "mr-auto max-w-full"
      )}
    >
      <MessageContent message={message} />
      <div
        className={cn(
          "flex items-start gap-1 text-muted-foreground",
          message.role === "user" && "flex-row-reverse"
        )}
      >
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 p-0"
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                <Copy
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Copy message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 p-0">
                <RefreshCw
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                  onClick={handleRegenerateMessage}
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
  );
});

MessageItem.displayName = "MessageItem";

export default function ConversationPage() {
  const { messages, status, reload, setInput, stop } = useChatContext();

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
    return () => {
      stop();
    };
  }, []);

  // Memoize the messages list to prevent unnecessary rerenders
  const messagesList = useMemo(
    () => (
      <div className="flex flex-col max-w-5xl mx-auto gap-4 px-2 pt-8">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {status === "submitted" && <LoadingDots className="text-muted-foreground" />}
        <div ref={messagesEndRef} />
      </div>
    ),
    [messages, status]
  );

  return (
    <ScrollArea
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="relative h-[calc(100svh-110px)] md:h-[calc(100svh-1rem-110px)]"
    >
      <div className="absolute top-0 left-0 right-0 max-w-5xl mx-auto h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 rounded-t-xl" />
      {messagesList}
      <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </ScrollArea>
  );
}
