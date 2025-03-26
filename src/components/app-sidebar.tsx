import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChatSidebar } from "./chat-sidebar";
import { SignOut } from "./signout-button";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center gap-2 pl-[22px] py-3.5">
        <p className="text-lg font-bold flex-1 text-center">Chat</p>
      </SidebarHeader>
      <SidebarContent className="px-3.5">
        <ChatSidebar />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOut />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
