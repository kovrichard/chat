import InputForm from "@/components/input-form";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      <div className="flex flex-1 flex-col min-w-[320px] max-h-svh md:max-h-[calc(100svh-1rem)] bg-background md:rounded-[20px]">
        {children}
        <InputForm />
      </div>
    </ChatProvider>
  );
}
