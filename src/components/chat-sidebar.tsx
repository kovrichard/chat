"use client";

import { useConversations } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { PartialConversation } from "@/types/chat";
import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { AnimatedTitle } from "./ui/animated-title";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "./ui/sidebar";

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
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversations();
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Flatten all pages of conversations
  const allConversations = data?.pages.flatMap((page) => page.conversations) || [];
  const groupedConversations = groupConversationsByTime(allConversations);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex flex-col flex-1 overflow-auto no-scrollbar">
      {isLoading ? (
        <SidebarGroup className="flex flex-col gap-1">
          <SidebarGroupLabel className="text-muted-foreground p-1">
            Just a moment...
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-md p-3">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2">
                    <div className="size-4 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-28 rounded-full bg-muted animate-pulse" />
                  </div>
                  <div className="h-4 w-full rounded-full bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      ) : (
        <>
          {groupedConversations.today.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary/70">Today</SidebarGroupLabel>
              <SidebarGroupContent>
                {groupedConversations.today.map((chat: PartialConversation) => (
                  <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {groupedConversations.yesterday.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary/70">Yesterday</SidebarGroupLabel>
              <SidebarGroupContent>
                {groupedConversations.yesterday.map((chat: PartialConversation) => (
                  <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {groupedConversations.lastWeek.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary/70">
                Previous 7 days
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {groupedConversations.lastWeek.map((chat: PartialConversation) => (
                  <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {groupedConversations.older.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary/70">Older</SidebarGroupLabel>
              <SidebarGroupContent>
                {groupedConversations.older.map((chat: PartialConversation) => (
                  <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {/* Load more trigger */}
          <div ref={loadMoreRef} className="h-4 w-full">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center p-2">
                <div className="flex gap-1">
                  <div className="size-2 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="size-2 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="size-2 rounded-full bg-muted animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
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
      prefetch
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
