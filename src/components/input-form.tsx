"use client";

import { Button } from "@/components/ui/button";
import { useUpdateConversationModel } from "@/lib/queries/conversations";
import { useModelStore } from "@/lib/stores/model-store";
import { IconPlayerStop } from "@tabler/icons-react";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, KeyboardEvent, forwardRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Anthropic from "./icons/anthropic";
import DeepSeek from "./icons/deepseek";
import Google from "./icons/google";
import Meta from "./icons/meta";
import OpenAI from "./icons/openai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const providers = [
  {
    name: "OpenAI",
    icon: OpenAI,
    models: [
      {
        id: "4o-mini",
        name: "GPT-4o mini",
      },
      {
        id: "o3-mini",
        name: "o3-mini",
      },
    ],
  },
  {
    name: "Anthropic",
    icon: Anthropic,
    models: [
      {
        id: "claude-3-7-sonnet",
        name: "Claude 3.7 Sonnet",
      },
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
      },
      {
        id: "claude-3-5-haiku",
        name: "Claude 3.5 Haiku",
      },
    ],
  },
  {
    name: "Google",
    icon: Google,
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
      },
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
      },
    ],
  },
  {
    name: "Meta",
    icon: Meta,
    models: [
      {
        id: "llama-3.3",
        name: "Llama 3.3",
      },
    ],
  },
  {
    name: "DeepSeek",
    icon: DeepSeek,
    models: [
      {
        id: "deepseek-r1",
        name: "DeepSeek R1",
      },
    ],
  },
];

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
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2 -mb-2 text-sm text-muted-foreground hover:text-primary"
                >
                  {model}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Select Model
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  defaultValue="4o-mini"
                  value={model}
                  onValueChange={handleModelChange}
                  className="space-y-2"
                >
                  {providers.map((provider) => (
                    <DropdownMenuGroup key={provider.name}>
                      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <provider.icon />
                        {provider.name}
                      </DropdownMenuLabel>
                      {provider.models.map((model) => (
                        <DropdownMenuRadioItem
                          key={model.id}
                          value={model.id}
                          className="text-sm cursor-pointer"
                        >
                          {model.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuGroup>
                  ))}
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
