"use client";

import { LinkButton } from "@/components/ui/button";
import { useConversations } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { PartialConversation } from "@/types/chat";
import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatedTitle } from "./ui/animated-title";

function groupConversationsByTime(conversations: PartialConversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups = {
    today: [] as PartialConversation[],
    yesterday: [] as PartialConversation[],
    lastWeek: [] as PartialConversation[],
    older: [] as PartialConversation[],
  };

  conversations.forEach((conv) => {
    const convDate = new Date(conv.lastMessageAt);

    if (convDate >= today) {
      groups.today.push(conv);
    } else if (convDate >= yesterday && convDate < today) {
      groups.yesterday.push(conv);
    } else if (convDate >= lastWeek && convDate < yesterday) {
      groups.lastWeek.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  return groups;
}

export function ChatSidebar() {
  const { id } = useParams();
  const { data: conversations = [], isLoading } = useConversations();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const groupedConversations = groupConversationsByTime(conversations);

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <LinkButton href="/chat" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </LinkButton>
      </div>
      <div className="flex flex-col flex-1 overflow-auto gap-1">
        {groupedConversations.today.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-muted-foreground px-3 py-1">Today</h3>
            {groupedConversations.today.map((chat: PartialConversation) => (
              <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
            ))}
          </>
        )}
        {groupedConversations.yesterday.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-muted-foreground px-3 py-1">
              Yesterday
            </h3>
            {groupedConversations.yesterday.map((chat: PartialConversation) => (
              <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
            ))}
          </>
        )}
        {groupedConversations.lastWeek.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-muted-foreground px-3 py-1">
              Previous 7 days
            </h3>
            {groupedConversations.lastWeek.map((chat: PartialConversation) => (
              <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
            ))}
          </>
        )}
        {groupedConversations.older.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-muted-foreground px-3 py-1">Older</h3>
            {groupedConversations.older.map((chat: PartialConversation) => (
              <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ConversationLink({
  chat,
  currentId,
}: {
  chat: PartialConversation;
  currentId: string;
}) {
  return (
    <Link
      href={`/chat/${chat.id}`}
      className={cn(
        "flex w-full flex-col items-start gap-1 rounded-lg p-3 text-left text-sm transition-colors",
        currentId === chat.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
      )}
    >
      <div className="flex w-full items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <AnimatedTitle text={chat.title} />
      </div>
      {chat?.messages?.length > 0 && (
        <p className="text-xs text-muted-foreground truncate w-full">
          {chat.messages[chat.messages.length - 1]?.content}
        </p>
      )}
    </Link>
  );
}
