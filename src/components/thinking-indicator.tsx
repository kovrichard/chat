import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useRef, useState } from "react";

interface ThinkingIndicatorProps {
  reasoning: string;
}

export function ThinkingIndicator({ reasoning }: ThinkingIndicatorProps) {
  const [isReasoning, setIsReasoning] = useState(true);
  const prevReasoningRef = useRef(reasoning);

  useEffect(() => {
    if (reasoning !== prevReasoningRef.current) {
      setIsReasoning(true);
      prevReasoningRef.current = reasoning;
    } else {
      // Use a small delay to ensure we don't show "finished" too early
      const timer = setTimeout(() => {
        setIsReasoning(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [reasoning]);

  return (
    <Sheet>
      <SheetTrigger>
        <span className="text-sm text-muted-foreground">
          {isReasoning ? "Reasoning..." : "Reasoning finished"}
        </span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Thought Process</SheetTitle>
          <SheetDescription className="sr-only">
            Steps taken to generate the response
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] mt-4">
          <div className="max-w-none text-muted-foreground text-sm">{reasoning}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
