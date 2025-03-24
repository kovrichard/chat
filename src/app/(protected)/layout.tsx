import { AppSidebar } from "@/components/app-sidebar";
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
        <SidebarInset>{children}</SidebarInset>
      </ChatProvider>
    </SidebarProvider>
  );
}
