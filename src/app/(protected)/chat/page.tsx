"use client";

import InputForm from "@/components/input-form";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/lib/contexts/chat-context";
import { useCreateConversation } from "@/lib/queries/conversations";
import { useModelStore } from "@/lib/stores/model-store";
import { PartialConversation } from "@/types/chat";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

const examples = [
  "105 degrees Fahrenheit to Celsius ",
  "Where do llamas live naturally? ",
  "What is the smallest country in Africa? ",
  "How can you help me? ",
];

export default function ChatPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createConversation = useCreateConversation();
  const { model, setModel } = useModelStore();
  const { input, handleInputChange } = useChatContext();

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const conversationId = uuidv4();
    const conversation: PartialConversation = {
      id: conversationId,
      title: "New Chat",
      model: model,
      messages: [
        {
          id: uuidv4(),
          content: input,
          role: "user" as const,
          reasoning: null,
          signature: null,
        },
      ],
      lastMessageAt: new Date(),
    };

    await createConversation.mutateAsync(conversation);
    router.push(`/chat/${conversationId}`);
  };

  const handleExampleClick = (example: string) => {
    handleInputChange({
      target: { value: example },
    } as ChangeEvent<HTMLTextAreaElement>);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const length = example.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 0);
  };

  useEffect(() => {
    setModel("4o-mini");
  }, []);

  return (
    <div className="flex flex-col h-svh min-w-[320px]">
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
      <InputForm ref={textareaRef} handleSubmit={handleSendMessage} />
    </div>
  );
}
