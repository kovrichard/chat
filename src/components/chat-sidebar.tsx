"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/ChatContext";
import { MessageSquare, Plus } from "lucide-react";

export function ChatSidebar() {
  const { state, createConversation, selectConversation } = useChatStore();

  return (
    <div>
      <div className="p-4">
        <Button
          onClick={() => createConversation("New Chat")}
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {state.conversations.map((chat) => (
          <button
            key={chat.id}
            onClick={() => selectConversation(chat.id)}
            className={cn(
              "flex w-full flex-col items-start gap-1 rounded-lg p-3 text-left text-sm transition-colors",
              state.selectedConversationId === chat.id
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted"
            )}
          >
            <div className="flex w-full items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium truncate flex-1">{chat.title}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate w-full">
              {chat?.messages[chat?.messages.length - 1]?.content}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
