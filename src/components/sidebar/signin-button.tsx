"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarMenuButton } from "../ui/sidebar";

export function SignIn() {
  const router = useRouter();
  return (
    <SidebarMenuButton className="h-10" onClick={() => router.push("/chat?login=true")}>
      <LogIn className="shrink-0" />
      <span>Sign In</span>
    </SidebarMenuButton>
  );
}
