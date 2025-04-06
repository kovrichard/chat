"use client";

import { Button } from "@/components/ui/button";
import { useChatContext } from "@/lib/contexts/chat-context";
import {
  useAddMessage,
  useCreateConversationOptimistic,
  useUpdateConversationModel,
} from "@/lib/queries/conversations";
import { useModelStore } from "@/lib/stores/model-store";
import { IconPlayerStop } from "@tabler/icons-react";
import { Send } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, KeyboardEvent, forwardRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { Feature, Model, Provider, providers } from "@/lib/providers";
import { debounce } from "@/lib/utils";
import { PartialConversation } from "@/types/chat";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
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
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function getModelName(modelId: string) {
  const model = providers
    .flatMap((provider) => provider.models)
    .find((m) => m.id === modelId);
  return model?.name;
}

const InputForm = forwardRef<HTMLTextAreaElement>((_, ref) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const conversationId = params.id as string;
  const { model, setModel } = useModelStore();
  const updateModel = useUpdateConversationModel();
  const createConversationOptimistic = useCreateConversationOptimistic();
  const addMessage = useAddMessage();
  const { input, handleInputChange, handleSubmit, status, stop } = useChatContext();
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(providers);
  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/subscription");
      return response.json();
    },
  });

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const value = e.target.value;
    const filtered = providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(value.toLowerCase()) ||
        provider.models.some((model) =>
          model.name.toLowerCase().includes(value.toLowerCase())
        )
    );
    setFilteredProviders(filtered);
  }
  const debouncedSearch = debounce(handleSearch);

  const handleModelChange = (value: string) => {
    setModel(value);

    if (conversationId) {
      updateModel.mutateAsync({ conversationId, model: value });
    }
  };

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }

  function handleSendMessage(
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) {
    e.preventDefault();
    if (!input.trim()) return;

    if (pathname === "/chat") {
      if (status !== "ready") return;

      const conversationId = uuidv4();
      const optimisticConversation: PartialConversation = {
        id: conversationId,
        title: "New Chat",
        model: model,
        messages: [
          {
            id: uuidv4(),
            content: input,
            role: "user",
            reasoning: null,
            signature: null,
          },
        ],
        lastMessageAt: new Date(),
      };

      createConversationOptimistic.mutate(optimisticConversation);
      router.push(`/chat/${conversationId}`);
    } else {
      addMessage.mutate({
        message: {
          id: uuidv4(),
          content: input,
          role: "user",
        },
        conversationId,
      });
      handleSubmit(e as FormEvent<HTMLFormElement>);
    }
  }

  return (
    <div className="flex-none sm:pb-4 sm:px-4">
      <form
        onSubmit={handleSendMessage}
        className="flex flex-col w-full max-w-5xl mx-auto items-end border rounded-t-xl sm:rounded-b-xl p-4 bg-card"
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
        <div className="flex items-center w-full gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 -mb-2 self-end text-sm text-muted-foreground hover:text-primary"
              >
                {getModelName(model)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <Input
                placeholder={`Search ${providers.flatMap((provider) => provider.models).length} models`}
                onChange={(e) => debouncedSearch(e)}
                className="ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <DropdownMenuSeparator />
              <ScrollArea className="relative h-96 pr-2">
                <div className="absolute top-0 left-0 right-0 mx-auto h-2 bg-gradient-to-b from-card to-transparent pointer-events-none z-10" />
                <DropdownMenuRadioGroup
                  defaultValue="4o-mini"
                  value={model}
                  onValueChange={handleModelChange}
                  className="space-y-2"
                >
                  {filteredProviders.map((provider) => (
                    <DropdownMenuGroup key={provider.name}>
                      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <provider.icon />
                        {provider.name}
                      </DropdownMenuLabel>
                      {provider.models.map((model: Model) => (
                        <DropdownMenuRadioItem
                          key={model.id}
                          value={model.id}
                          className="text-sm cursor-pointer"
                        >
                          <div className="flex flex-1 items-center justify-between gap-2">
                            <span>{model.name}</span>
                            {model.features?.map((feature: Feature) => (
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
                <div className="absolute bottom-0 left-0 right-0 mx-auto h-2 bg-gradient-to-t from-card to-transparent pointer-events-none z-10" />
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center ml-auto">
            {subscription && (
              <Button
                variant="ghost"
                type="button"
                className="text-sm text-muted-foreground h-9"
              >
                {subscription.freeMessages <= 0 ? (
                  <span>Out of messages</span>
                ) : subscription.freeMessages === 1 ? (
                  <span>{subscription.freeMessages} message left</span>
                ) : (
                  <span>{subscription.freeMessages} messages left</span>
                )}
              </Button>
            )}
          </div>
          {status === "submitted" || status === "streaming" ? (
            <Button
              type="submit"
              size="icon"
              className="shrink-0 size-9"
              onClick={() => stop()}
            >
              <IconPlayerStop size={16} />
            </Button>
          ) : (
            <Button type="submit" size="icon" className="shrink-0 size-9">
              <Send size={16} />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
});

InputForm.displayName = "InputForm";

export default InputForm;
