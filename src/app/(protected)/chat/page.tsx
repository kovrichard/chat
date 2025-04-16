"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChatContext } from "@/lib/contexts/chat-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { providers } from "@/lib/providers";
import { useInputStore } from "@/stores/input-store";
import { IconBrain, IconGlobe } from "@tabler/icons-react";
import { Globe } from "lucide-react";
import { Brain } from "lucide-react";
import { useEffect } from "react";

const models = providers.map((provider) => provider.models).flat();
const numModels = models.length;

const examples = [
  "105 degrees Fahrenheit to Celsius ",
  "Where do llamas live naturally? ",
  "What is the smallest country in Africa? ",
  "How can you help me? ",
];

export default function ChatPage() {
  const { setModelId } = useChatContext();
  const { setInput } = useInputStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Which model should I use?</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>We have {numModels} models</DialogTitle>
              <DialogDescription>Which one should you use?</DialogDescription>
              <div className="flex flex-col gap-4 py-4">
                <p>
                  Small (mini, nano, etc.) models are faster, but less accurate. They are
                  still enough for most use cases.
                </p>
                <p>
                  Models with the <Brain className="inline-flex text-yellow-500" /> icon
                  next to them will think a bit before responding. Use them for complex
                  questions.
                </p>
                <p>
                  Models with the <Globe className="inline-flex text-blue-500" /> icon
                  next to them have internet access. Use them for questions that require
                  the latest information.
                </p>
                <p>
                  All models are general-purpose. Try them out and see which one works
                  best for you.
                </p>
                <p>
                  Click the model's {isMobile ? "icon" : "name"} in the lower left corner
                  of the input field to select a different one.
                </p>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
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
