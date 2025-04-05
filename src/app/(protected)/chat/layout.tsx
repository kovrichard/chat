"use client";

import InputForm from "@/components/input-form";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { useConversation } from "@/lib/queries/conversations";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const conversationId = params.id as string;
  const { data: conversation } = useConversation(conversationId);

  return (
    <ChatProvider id={conversationId} initialMessages={conversation?.messages}>
      <div className="flex flex-1 flex-col min-w-[320px] max-h-svh md:max-h-[calc(100svh-1rem)] bg-background md:rounded-[20px]">
        {children}
        <InputForm />
      </div>
    </ChatProvider>
  );
}
