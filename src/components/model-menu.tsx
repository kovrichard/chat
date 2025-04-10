"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Feature, providers } from "@/lib/providers";
import { useUpdateConversationModel } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useState } from "react";
import React from "react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function getProviderIcon(modelId: string) {
  const provider = providers.find((p) => p.models.some((m) => m.id === modelId));
  return provider?.icon;
}

export function ModelMenu() {
  const [open, setOpen] = useState(false);
  const { model } = useChatContext();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const providerIcon = getProviderIcon(model.id);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="hidden md:block">
          <Button variant="ghost" size="sm" className="-ml-2 -mb-4">
            {model.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <StatusList setOpen={setOpen} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild className="md:hidden">
        <Button variant="outline" size="icon" className="size-9">
          {providerIcon && React.createElement(providerIcon)}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Select a model</DrawerTitle>
          <DrawerDescription>
            Choose a model to use for your conversation.
          </DrawerDescription>
        </DrawerHeader>
        <div className="mt-4 border-t">
          <StatusList setOpen={setOpen} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function StatusList({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { id, model, setModelId } = useChatContext();
  const updateModel = useUpdateConversationModel();

  const handleModelChange = (value: string) => {
    setModelId(value);

    if (id) {
      updateModel.mutateAsync({ conversationId: id, model: value });
    }
  };

  const modelCount = providers.reduce((acc, provider) => acc + provider.models.length, 0);

  return (
    <Command className="rounded-none md:rounded-md" defaultValue={model.name}>
      <CommandInput placeholder={`Filter ${modelCount} models...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {providers.map((provider) => (
          <CommandGroup
            key={provider.name}
            heading={
              <div className="flex items-center gap-2">
                <provider.icon />
                {provider.name}
              </div>
            }
          >
            {provider.models.map((model) => (
              <CommandItem
                key={model.name}
                value={model.name}
                onSelect={() => {
                  handleModelChange(model.id);
                  setOpen(false);
                }}
                className="group flex justify-between pl-6"
              >
                <span>{model.name}</span>
                {model.features?.map((feature: Feature) => (
                  <Tooltip key={feature.name}>
                    <TooltipTrigger asChild>
                      <feature.icon
                        size={16}
                        className={cn(
                          feature.color,
                          "group-data-[selected='true']:text-accent-foreground"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>{feature.description}</TooltipContent>
                  </Tooltip>
                ))}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
