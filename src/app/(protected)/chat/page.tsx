"use client";

import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/ChatContext";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent } from "react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { createConversation } = useChatStore();
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create a new conversation with the input as first message
    const conversationId = createConversation(input.split("\n")[0].slice(0, 30), input);

    // Redirect to the conversation page
    router.push(`/chat/${conversationId}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] min-w-[320px]">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-4">
          <h1 className="text-4xl font-bold">Chat Assistant</h1>
          <p className="text-muted-foreground">
            Start a new conversation by typing your message below.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="flex-none p-4 border-t bg-background">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-5xl mx-auto items-end gap-2"
        >
          <TextareaAutosize
            placeholder="Type your message... (Shift + Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex min-h-10 max-h-80 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
          <Button type="submit" size="icon" className="shrink-0">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
