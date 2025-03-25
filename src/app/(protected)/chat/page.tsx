"use client";

import InputForm from "@/components/input-form";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/ChatContext";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useRef } from "react";
import { useState } from "react";

const examples = [
  "105 degrees Fahrenheit to Celsius ",
  "Where do llamas live naturally? ",
  "What is the smallest country in Africa? ",
  "How can you help me? ",
];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { createConversation } = useChatStore();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create a new conversation with the input as first message
    const conversationId = await createConversation("New Chat", input);

    // Redirect to the conversation page
    router.push(`/chat/${conversationId}`);
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit(e as any);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    // Focus the textarea and place cursor at the end after a short delay to ensure the state has updated
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const length = example.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 0);
  };

  return (
    <div className="flex flex-col h-screen min-w-[320px]">
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
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Input Form */}
      <InputForm
        ref={textareaRef}
        input={input}
        handleChange={(e) => setInput(e.target.value)}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
      />
    </div>
  );
}
