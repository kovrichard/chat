import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChatSidebar } from "./chat-sidebar";
import { SignOut } from "./signout-button";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="pl-[22px] py-3.5">
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <ChatSidebar />
      </SidebarContent>
      <SidebarFooter className="p-3.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOut />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
