"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import Link from "next/link";

export function NewChatButton() {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Button asChild className="w-full gap-2">
      <Link href="/chat" prefetch onClick={() => isMobile && setOpenMobile(false)}>
        <Plus className="h-4 w-4" />
        New Chat
      </Link>
    </Button>
  );
}
