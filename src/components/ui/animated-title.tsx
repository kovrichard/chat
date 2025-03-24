import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AnimatedTitleProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedTitle({ text, className, delay = 50 }: AnimatedTitleProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, delay]);

  return (
    <span className={cn("inline-block whitespace-nowrap truncate", className)}>
      {displayedText}
      {currentIndex < text.length && <span className="animate-pulse">▋</span>}
    </span>
  );
}
