"use client";

import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/ChatContext";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent } from "react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

const examples = [
  "105 degrees Fahrenheit to Celsius",
  "Where do llamas live naturally?",
  "What is the smallest country in Africa?",
  "How can you help me?",
];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { createConversation } = useChatStore();
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create a new conversation with the input as first message
    const conversationId = createConversation("New Chat", input);

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
        <div className="max-w-xl w-full space-y-4">
          <h1 className="text-4xl font-bold">Chat with me</h1>
          <ul className="flex flex-col">
            {examples.map((example) => (
              <li
                key={example}
                className="border-b py-1.5 last:border-b-0 text-muted-foreground"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setInput(example)}
                >
                  {example}
                </Button>
              </li>
            ))}
          </ul>
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
            className="flex min-h-10 max-h-80 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
          />
          <Button type="submit" size="icon" className="shrink-0">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
