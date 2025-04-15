"use client";

import { Button } from "@/components/ui/button";
import { useChatContext } from "@/lib/contexts/chat-context";
import {
  useAddMessage,
  useCreateConversationOptimistic,
} from "@/lib/queries/conversations";
import { IconPlayerStop } from "@tabler/icons-react";
import { Send } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, forwardRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useInputStore } from "@/stores/input-store";
import { PartialConversation } from "@/types/chat";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { ModelMenu } from "./model-menu";

const InputForm = forwardRef<
  HTMLTextAreaElement,
  { plan: string; freeMessages: number; className?: string }
>(({ plan, freeMessages, className }, ref) => {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const createConversationOptimistic = useCreateConversationOptimistic();
  const addMessage = useAddMessage();
  const { input, setInput } = useInputStore();
  const { id, model, status, append, stop } = useChatContext();
  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/subscription");
      return response.json();
    },
    initialData: {
      plan,
      freeMessages,
    },
  });

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }

  function handleSendMessage(
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) {
    e.preventDefault();
    if (!input.trim()) return;

    if (status !== "ready") return;

    if (pathname === "/chat") {
      const conversationId = uuidv4();
      const optimisticConversation: PartialConversation = {
        id: conversationId,
        title: "New Chat",
        model: model.id,
        messages: [
          {
            id: uuidv4(),
            content: input,
            role: "user",
            reasoning: null,
            signature: null,
          },
        ],
        lastMessageAt: new Date(),
      };

      createConversationOptimistic.mutate(optimisticConversation);
      setInput("");
      router.push(`/chat/${conversationId}`);
    } else {
      addMessage.mutate({
        message: {
          id: uuidv4(),
          content: input,
          role: "user",
        },
        conversationId: id,
      });
      setTimeout(() => {
        append({
          id: uuidv4(),
          role: "user",
          content: input,
        });
      }, 200);
      setInput("");
    }
  }

  return (
    <div
      className={cn(
        "flex-none pt-1 sm:px-4 sm:pb-4 max-w-5xl w-full mx-auto bg-background",
        className
      )}
    >
      <form
        onSubmit={handleSendMessage}
        className="flex flex-col items-end border rounded-t-xl sm:rounded-b-xl p-4 bg-card"
      >
        <TextareaAutosize
          id="message-input"
          ref={ref}
          placeholder={isMobile ? "Enter message" : "(Shift + Enter for new line)"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex min-h-10 max-h-80 w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-sm resize-none"
        />
        <div className="flex items-center w-full gap-2">
          <ModelMenu />
          <div className="flex items-center ml-auto">
            {subscription && subscription.plan === "free" && (
              <p className="text-sm text-muted-foreground font-medium h-9 px-4 py-2">
                {subscription.freeMessages <= 0 ? (
                  <span>Out of messages</span>
                ) : subscription.freeMessages === 1 ? (
                  <span>{subscription.freeMessages} message left</span>
                ) : (
                  <span>{subscription.freeMessages} messages left</span>
                )}
              </p>
            )}
          </div>
          {status === "submitted" || status === "streaming" ? (
            <Button
              type="submit"
              size="icon"
              className="shrink-0 size-9"
              onClick={() => stop()}
            >
              <IconPlayerStop size={16} />
            </Button>
          ) : (
            <Button type="submit" size="icon" className="shrink-0 size-9">
              <Send size={16} />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
});

InputForm.displayName = "InputForm";

export default InputForm;
