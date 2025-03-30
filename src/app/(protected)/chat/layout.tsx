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
      <div className="flex flex-col h-svh min-w-[320px]">
        {children}
        <InputForm />
      </div>
    </ChatProvider>
  );
}
