import ChatSidebar from "@/components/sidebar/chat-sidebar";
import { NewChatButton } from "@/components/sidebar/new-chat-button";
import ProfileMenu from "@/components/sidebar/profile-menu";
import { SearchField } from "@/components/sidebar/search-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { getUserFromSessionPublic } from "@/lib/dao/users";
import { stripeConfigured } from "@/lib/stripe";
import { SwipeDetector } from "./swipe-detector";

export async function AppSidebar() {
  const user = await getUserFromSessionPublic();
  const conversations = user ? await getConversations(1, 15) : [];

  return (
    <>
      <Sidebar className="border-none">
        <SidebarHeader className="flex-col items-center gap-4 py-4 pl-4 pr-4 md:pr-2">
          <p className="text-lg font-bold flex-1 text-center">Fyzz.chat</p>
          <NewChatButton />
          <SearchField />
        </SidebarHeader>
        <SidebarContent className="relative pl-2 pr-2 md:pr-0">
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-sidebar to-transparent pointer-events-none z-10" />
          <ChatSidebar conversations={conversations} authorized={Boolean(user)} />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-sidebar to-transparent pointer-events-none z-10" />
        </SidebarContent>
        <SidebarFooter className="pl-4 py-4 pr-4 md:pr-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="h-auto">
                  <SidebarMenuButton>
                    <Avatar className="size-7">
                      <AvatarImage src={user?.picture || ""} />
                      <AvatarFallback className="text-muted-foreground">
                        {user?.name
                          ?.split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("") || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <p>{user?.name || "Anonymous"}</p>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 md:w-[15rem]">
                  <ProfileMenu
                    authorized={Boolean(user)}
                    hasCustomerId={Boolean(user?.customerId)}
                    stripeConfigured={stripeConfigured}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SwipeDetector />
    </>
  );
}
