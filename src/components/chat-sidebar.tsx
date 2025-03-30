"use client";

import { LinkButton } from "@/components/ui/button";
import { useConversations } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { PartialConversation } from "@/types/chat";
import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
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
    <div className="flex flex-col h-full gap-4">
      <div>
        <LinkButton href="/chat" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </LinkButton>
      </div>
      <div className="flex flex-col flex-1 overflow-auto gap-1">
        {isLoading ? (
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-medium text-muted-foreground p-1">
              Just a moment...
            </h3>
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
          </div>
        ) : (
          <>
            {groupedConversations.today.length > 0 && (
              <>
                <h3 className="text-xs font-medium text-primary/70 p-1">Today</h3>
                {groupedConversations.today.map((chat: PartialConversation) => (
                  <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
                ))}
              </>
            )}
            {groupedConversations.yesterday.length > 0 && (
              <>
                <h3 className="text-xs font-medium text-primary/70 p-1">Yesterday</h3>
                {groupedConversations.yesterday.map((chat: PartialConversation) => (
                  <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
                ))}
              </>
            )}
            {groupedConversations.lastWeek.length > 0 && (
              <>
                <h3 className="text-xs font-medium text-primary/70 p-1">
                  Previous 7 days
                </h3>
                {groupedConversations.lastWeek.map((chat: PartialConversation) => (
                  <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
                ))}
              </>
            )}
            {groupedConversations.older.length > 0 && (
              <>
                <h3 className="text-xs font-medium text-primary/70 p-1">Older</h3>
                {groupedConversations.older.map((chat: PartialConversation) => (
                  <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
                ))}
              </>
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
      prefetch={true}
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
