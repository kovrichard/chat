import { AppSidebar } from "@/components/app-sidebar";
import TopMenu from "@/components/top-menu";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatProvider } from "@/store/ChatContext";
import { cookies } from "next/headers";
import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <ChatProvider>
        <AppSidebar />
        <SidebarInset>
          <TopMenu />
          {children}
        </SidebarInset>
      </ChatProvider>
    </SidebarProvider>
  );
}
