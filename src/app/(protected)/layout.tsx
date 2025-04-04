import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getUserFromSession } from "@/lib/dao/users";
import { cookies } from "next/headers";
import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getUserFromSession();

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="relative md:p-2 bg-sidebar">
        <SidebarTrigger className="absolute top-4 left-4 z-10" />
        <ThemeToggle className="absolute top-4 right-4 z-10" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
