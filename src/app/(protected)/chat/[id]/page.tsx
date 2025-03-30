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
import { Message } from "ai";
import { useParams, useRouter } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

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
  const updateTitle = useUpdateConversationTitle();
  const addMessage = useAddMessage();
  const { model, setModel } = useModelStore();

  const { messages, input, handleInputChange, handleSubmit, status, stop, reload } =
    useChat({
      id: conversationId,
      initialMessages: conversation?.messages || [],
      body: {
        model,
      },
      onFinish: (message: Message) => {
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const hasReloaded = useRef(false);

  // Handle initial message if present
  useEffect(() => {
    if (!hasReloaded.current && messages.length === 1) {
      hasReloaded.current = true;
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

  const handleSendMessage = useCallback(
    async (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();

      if (input.trim() === "") {
        return;
      }

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
    },
    [handleSubmit, input, conversationId, addMessage]
  );

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        handleSendMessage(e);
      }
    },
    [handleSendMessage]
  );

  useEffect(() => {
    if (!isLoading && !conversation) {
      router.push("/chat");
    }

    if (conversation?.model) {
      setModel(conversation.model);
    }
  }, [conversation, isLoading, router, setModel]);

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
