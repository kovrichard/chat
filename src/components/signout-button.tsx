"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { SidebarMenuButton } from "./ui/sidebar";

export function SignOut() {
  return (
    <SidebarMenuButton className="h-10" onClick={() => signOut()}>
      <LogOut className="shrink-0" />
      <span>Sign Out</span>
    </SidebarMenuButton>
  );
}
