"use client";

import { Button } from "@/components/ui/button";
import { useModelStore } from "@/lib/stores/model-store";
import { IconPlayerStop } from "@tabler/icons-react";
import { Send } from "lucide-react";
import { ChangeEvent, FormEvent, KeyboardEvent, forwardRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

const InputForm = forwardRef<HTMLTextAreaElement, InputFormProps>(
  ({ input, handleChange, handleSubmit, handleKeyDown, status, handleStop }, ref) => {
    const { model, setModel } = useModelStore();

    return (
      <div className="flex-none p-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full max-w-5xl mx-auto items-end border rounded-xl p-4"
        >
          <TextareaAutosize
            ref={ref}
            placeholder="(Shift + Enter for new line)"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex min-h-10 max-h-80 w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-sm resize-none"
          />
          <div className="flex items-end w-full gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm text-muted-foreground">
                {model}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="ml-8">
                <DropdownMenuLabel>Models</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setModel("gpt-4o-mini")}>
                    4o-mini
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setModel("o3-mini")}>
                    o3-mini
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setModel("llama-3.3")}>
                    llama-3.3
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setModel("deepseek-r1")}>
                    deepseek-r1
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {status === "submitted" || status === "streaming" ? (
              <Button
                type="submit"
                size="icon"
                className="shrink-0 ml-auto size-9"
                onClick={() => handleStop?.()}
              >
                <IconPlayerStop size={16} />
              </Button>
            ) : (
              <Button type="submit" size="icon" className="shrink-0 ml-auto size-9">
                <Send size={16} />
              </Button>
            )}
          </div>
        </form>
      </div>
    );
  }
);

InputForm.displayName = "InputForm";

export default InputForm;
