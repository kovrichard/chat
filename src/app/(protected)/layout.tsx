import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getUserIdFromSession } from "@/lib/dao/users";
import { cookies } from "next/headers";
import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getUserIdFromSession();

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="relative md:p-2 bg-sidebar overflow-auto">
        <SidebarTrigger className="absolute size-8 top-4 left-4 z-20" />
        <ThemeToggle className="fixed top-3 right-3 z-20" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
