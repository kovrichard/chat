"use client";

import { Button } from "@/components/ui/button";
import { IconPlayerStop } from "@tabler/icons-react";
import { Send } from "lucide-react";
import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface InputFormProps {
  input: string;
  handleChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  handleStop?: () => void;
  status?: string;
}

export default function InputForm({
  input,
  handleChange,
  handleSubmit,
  handleKeyDown,
  status,
  handleStop,
}: InputFormProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-5xl mx-auto items-end gap-2"
    >
      <TextareaAutosize
        placeholder="(Shift + Enter for new line)"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
        className="flex min-h-10 max-h-80 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-sm resize-none"
      />
      {status === "submitted" || status === "streaming" ? (
        <Button type="submit" size="icon" onClick={() => handleStop?.()}>
          <IconPlayerStop size={16} />
        </Button>
      ) : (
        <Button type="submit" size="icon" className="shrink-0">
          <Send size={16} />
        </Button>
      )}
    </form>
  );
}
