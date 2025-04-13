import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getConversations } from "@/lib/dao/conversations";
import { getUserFromSession } from "@/lib/dao/users";
import { Plus } from "lucide-react";
import Link from "next/link";
import ChatSidebar from "./chat-sidebar";
import ProfileMenu from "./profile-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export async function AppSidebar() {
  const userData = getUserFromSession();
  const conversationsData = getConversations(1, 15);
  const [user, conversations] = await Promise.all([userData, conversationsData]);

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
        <ChatSidebar conversations={conversations} />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-sidebar to-transparent pointer-events-none z-10" />
      </SidebarContent>
      <SidebarFooter className="pl-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="h-auto">
                <SidebarMenuButton>
                  <Avatar className="size-7">
                    <AvatarImage src={user?.picture || ""} />
                    <AvatarFallback>
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <p>{user.name || "User"}</p>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="md:w-64">
                <ProfileMenu />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
