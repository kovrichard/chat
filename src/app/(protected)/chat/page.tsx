"use client";

import InputForm from "@/components/input-form";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/ChatContext";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent } from "react";
import { useState } from "react";

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
        <InputForm
          input={input}
          handleChange={(e) => setInput(e.target.value)}
          handleSubmit={handleSubmit}
          handleKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
