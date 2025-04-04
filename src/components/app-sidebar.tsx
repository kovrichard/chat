import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ChatSidebar } from "./chat-sidebar";
import { SignOut } from "./signout-button";
import { Button } from "./ui/button";

export function AppSidebar() {
  return (
    <Sidebar className="border-none">
      <SidebarHeader className="flex-col items-center gap-4 py-4 pl-4">
        <p className="text-lg font-bold flex-1 text-center">Chat</p>
        <Button asChild className="w-full gap-2">
          <Link href="/chat" prefetch>
            <Plus className="h-4 w-4" />
            New Chat
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent className="relative pl-2">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-sidebar to-transparent pointer-events-none z-10" />
        <ChatSidebar />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-sidebar to-transparent pointer-events-none z-10" />
      </SidebarContent>
      <SidebarFooter className="pl-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOut />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
