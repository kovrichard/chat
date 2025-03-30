"use client";

import { Button } from "@/components/ui/button";
import { useChatContext } from "@/lib/contexts/chat-context";
import { useUpdateConversationModel } from "@/lib/queries/conversations";
import { useModelStore } from "@/lib/stores/model-store";
import { IconPlayerStop } from "@tabler/icons-react";
import { Brain, Globe, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, KeyboardEvent, forwardRef, lazy } from "react";
import TextareaAutosize from "react-textarea-autosize";
const LazyAnthropic = dynamic(() => import("./icons/anthropic"));
const LazyDeepSeek = dynamic(() => import("./icons/deepseek"));
const LazyGoogle = dynamic(() => import("./icons/google"));
const LazyMeta = dynamic(() => import("./icons/meta"));
const LazyOpenAI = dynamic(() => import("./icons/openai"));

import dynamic from "next/dynamic";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const reasoning = {
  name: "Reasoning",
  description: "Reasoning model",
  icon: Brain,
  color: "text-yellow-500",
};

const search = {
  name: "Search",
  description: "Searches the web for information",
  icon: Globe,
  color: "text-blue-500",
};

const providers = [
  {
    name: "OpenAI",
    icon: LazyOpenAI,
    models: [
      {
        id: "4o-mini",
        name: "GPT-4o mini",
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        features: [reasoning],
      },
    ],
  },
  {
    name: "Anthropic",
    icon: LazyAnthropic,
    models: [
      {
        id: "claude-3-7-sonnet",
        name: "Claude 3.7 Sonnet",
      },
      {
        id: "claude-3-7-sonnet-reasoning",
        name: "Claude 3.7 Sonnet Reasoning",
        features: [reasoning],
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
    icon: LazyGoogle,
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        features: [search],
      },
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
      },
    ],
  },
  {
    name: "Meta",
    icon: LazyMeta,
    models: [
      {
        id: "llama-3.3",
        name: "Llama 3.3",
      },
    ],
  },
  {
    name: "DeepSeek",
    icon: LazyDeepSeek,
    models: [
      {
        id: "deepseek-r1",
        name: "DeepSeek R1",
        features: [reasoning],
      },
    ],
  },
];

function getModelName(modelId: string) {
  const model = providers
    .flatMap((provider) => provider.models)
    .find((m) => m.id === modelId);
  return model?.name;
}

interface InputFormProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const InputForm = forwardRef<HTMLTextAreaElement, InputFormProps>(
  ({ handleSubmit }, ref) => {
    const params = useParams();
    const conversationId = params.id as string;
    const { model, setModel } = useModelStore();
    const updateModel = useUpdateConversationModel();
    const { input, handleInputChange, status, stop } = useChatContext();

    const handleModelChange = (value: string) => {
      setModel(value);

      if (conversationId) {
        updateModel.mutateAsync({ conversationId, model: value });
      }
    };

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    }

    return (
      <div className="flex-none p-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full max-w-5xl mx-auto items-end border rounded-xl p-4 bg-card"
        >
          <TextareaAutosize
            id="message-input"
            ref={ref}
            placeholder="(Shift + Enter for new line)"
            value={input}
            onChange={handleInputChange}
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
                  {getModelName(model)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
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
                          <div className="flex flex-1 items-center justify-between gap-2">
                            <span>{model.name}</span>
                            {model.features?.map((feature) => (
                              <Tooltip key={feature.name}>
                                <TooltipTrigger asChild>
                                  <feature.icon size={16} className={feature.color} />
                                </TooltipTrigger>
                                <TooltipContent>{feature.description}</TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
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
                onClick={() => stop()}
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
