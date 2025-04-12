import InputForm from "@/components/input-form";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { getUserFromSession } from "@/lib/dao/users";
import { ReactNode } from "react";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const user = await getUserFromSession();

  return (
    <ChatProvider>
      <div className="flex flex-1 flex-col min-w-[320px] max-h-svh md:max-h-[calc(100svh-1rem)] sm:pb-4 sm:px-4 bg-background md:rounded-[20px]">
        {children}
        <InputForm freeMessages={user?.freeMessages} />
      </div>
    </ChatProvider>
  );
}
