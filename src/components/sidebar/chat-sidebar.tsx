"use client";

import { useConversations, useDeleteConversation } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";
import { PartialConversation } from "@/types/chat";
import { MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { AnimatedTitle } from "../ui/animated-title";
import { Button } from "../ui/button";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "../ui/sidebar";

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

  conversations
    .filter((conv) => !!conv)
    .forEach((conv) => {
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

export default function ChatSidebar({ conversations }: { conversations: any }) {
  const { id } = useParams();
  const { searchQuery } = useSearchStore();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useConversations(
    conversations,
    searchQuery
  );
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
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
      // Trigger when the new element is 1px from the bottom of the viewport
      { threshold: 0 }
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
      {groupedConversations.today.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70">Today</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {groupedConversations.today.map((chat: PartialConversation) => (
              <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      {groupedConversations.yesterday.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70">Yesterday</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
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
          <SidebarGroupContent className="space-y-1">
            {groupedConversations.lastWeek.map((chat: PartialConversation) => (
              <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      {groupedConversations.older.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70">Older</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {groupedConversations.older.map((chat: PartialConversation) => (
              <ConversationLink key={chat.id} chat={chat} currentId={id as string} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      {/* Load more trigger */}
      {isFetchingNextPage && (
        <div ref={loadMoreRef} className="h-4 w-full">
          <div className="flex items-center justify-center p-2">
            <div className="flex gap-1">
              <div className="size-2 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]"></div>
              <div className="size-2 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]"></div>
              <div className="size-2 rounded-full bg-muted animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
      {allConversations.length === 0 && searchQuery && (
        <SidebarGroup>
          <SidebarGroupLabel className="inline-flex items-center justify-center text-muted-foreground">
            No conversations found
          </SidebarGroupLabel>
        </SidebarGroup>
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
  const deleteConversation = useDeleteConversation();
  const router = useRouter();

  return (
    <div className="group/chat relative">
      <Link
        href={`/chat/${chat.id}`}
        prefetch
        className={cn(
          "flex w-full flex-col items-start gap-1 rounded-lg p-3 text-left text-sm transition-colors",
          currentId === chat.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
        )}
      >
        <div className="flex w-full items-center gap-2">
          <MessageSquare size={16} className="shrink-0" />
          <AnimatedTitle text={chat.title} />
          <div className="hidden group-hover/chat:inline-flex size-5" />
        </div>
        {chat?.messages?.length > 0 && (
          <p
            className={cn(
              "text-xs text-muted-foreground truncate w-full",
              currentId === chat.id && "text-accent-foreground"
            )}
          >
            {chat.messages[chat.messages.length - 1]?.content}
          </p>
        )}
      </Link>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 hidden group-hover/chat:inline-flex items-center justify-center p-2 size-5 hover:bg-transparent z-10"
          >
            <Trash2
              size={16}
              className={cn(
                "text-muted-foreground",
                currentId === chat.id && "text-accent-foreground"
              )}
            />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You won't see this conversation ever again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteConversation.mutateAsync({
                  conversationId: chat.id,
                });
                if (currentId === chat.id) {
                  router.push("/chat");
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
