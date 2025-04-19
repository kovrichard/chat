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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { providers } from "@/lib/providers";
import { useInputStore } from "@/stores/input-store";
import { useModelStore } from "@/stores/model-store";
import { Brain, CodeXml, Globe } from "lucide-react";
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
  const { setModel } = useModelStore();
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
    setModel("4o-mini");
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-4">
        <h1 className="text-4xl font-bold">Chat with me</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Which model should I use?</Button>
          </DialogTrigger>
          <DialogContent className="px-0">
            <DialogHeader className="px-6">
              <DialogTitle>We have {numModels} models</DialogTitle>
              <DialogDescription>Which one should you use?</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[350px]">
              <div className="flex flex-col gap-4 px-6 pb-4 sm:pb-0">
                <p>
                  Small (mini, nano, etc.) models are faster, but less accurate. They are
                  still enough for most use cases.
                </p>
                <p>
                  Models with the <Brain className="inline-flex text-yellow-500" /> icon
                  take time to respond. Use them for complex questions.
                </p>
                <p>
                  Models with the <Globe className="inline-flex text-blue-500" /> icon
                  have internet access. Use them for up-to-date information.
                </p>
                <p>
                  Models with the <CodeXml className="inline-flex text-green-500" /> icon
                  are ideal for coding questions.
                </p>
                <p>
                  All models are general-purpose. Experiment to find the best fit for you.
                </p>
                <p>
                  Click the model's {isMobile ? "icon" : "name"} in the lower left corner
                  of the input field to switch models.
                </p>
              </div>
            </ScrollArea>
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
