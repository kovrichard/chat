"use client";

import { MessageContent } from "@/components/message-content";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loading-dots";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/ChatContext";
import { useChat } from "@ai-sdk/react";
import { IconPlayerStop } from "@tabler/icons-react";
import { Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const { state, addMessage } = useChatStore();
  const conversation = state.conversations.find((c) => c.id === conversationId);
  const isNewConversation = conversation?.messages.length === 1;
  const initialMessage = conversation?.messages[0] || "";

  const { messages, input, setInput, handleInputChange, handleSubmit, status, stop } =
    useChat({
      id: conversationId,
      initialMessages: isNewConversation ? [] : conversation?.messages || [],
      onFinish: (message) => {
        addMessage(message.content, "assistant");
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
    <div className="flex flex-col h-[calc(100vh-4rem)] min-w-[320px]">
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
      <div className="flex-none p-4 border-t bg-background">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full max-w-5xl mx-auto items-end gap-2"
        >
          <TextareaAutosize
            placeholder="Enter your message (Shift + Enter for new line)"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex min-h-10 max-h-80 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
          />
          {status === "submitted" || status === "streaming" ? (
            <Button type="submit" size="icon" onClick={() => stop()}>
              <IconPlayerStop size={16} />
            </Button>
          ) : (
            <Button type="submit" size="icon" className="shrink-0">
              <Send size={16} />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
