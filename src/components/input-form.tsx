"use client";

import { Button } from "@/components/ui/button";
import { useUpdateConversationModel } from "@/lib/queries/conversations";
import { useModelStore } from "@/lib/stores/model-store";
import { IconPlayerStop } from "@tabler/icons-react";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, KeyboardEvent, forwardRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
    const params = useParams();
    const conversationId = params.id as string;
    const { model, setModel } = useModelStore();
    const updateModel = useUpdateConversationModel();

    const handleModelChange = (value: string) => {
      setModel(value);

      if (conversationId) {
        updateModel.mutateAsync({ conversationId, model: value });
      }
    };

    return (
      <div className="flex-none p-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full max-w-5xl mx-auto items-end border rounded-xl p-4 bg-card"
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
              <DropdownMenuTrigger className="text-sm text-primary/70">
                {model}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Models</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  defaultValue="4o-mini"
                  value={model}
                  onValueChange={handleModelChange}
                >
                  <DropdownMenuLabel>OpenAI</DropdownMenuLabel>
                  <DropdownMenuRadioItem value="4o-mini">4o-mini</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="o3-mini">o3-mini</DropdownMenuRadioItem>
                  <DropdownMenuLabel>Llama</DropdownMenuLabel>
                  <DropdownMenuRadioItem value="llama-3.3">
                    llama-3.3
                  </DropdownMenuRadioItem>
                  <DropdownMenuLabel>DeepSeek</DropdownMenuLabel>
                  <DropdownMenuRadioItem value="deepseek-r1">
                    deepseek-r1
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
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
