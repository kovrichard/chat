"use client";

import { Button } from "@/components/ui/button";
import { useChatContext } from "@/lib/contexts/chat-context";
import { useInputStore } from "@/stores/input-store";
import { useEffect } from "react";

const examples = [
  "105 degrees Fahrenheit to Celsius ",
  "Where do llamas live naturally? ",
  "What is the smallest country in Africa? ",
  "How can you help me? ",
];

export default function ChatPage() {
  const { setModelId } = useChatContext();
  const { setInput } = useInputStore();

  const handleExampleClick = (example: string) => {
    setInput(example);
    setTimeout(() => {
      const textarea = document.getElementById("message-input") as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        const length = example.length;
        textarea.setSelectionRange(length, length);
      }
    }, 0);
  };

  useEffect(() => {
    setModelId("4o-mini");
  }, []);

  return (
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
  );
}
