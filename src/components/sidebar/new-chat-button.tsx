"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NewChatButton() {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();

  function handleMouseDown(e: any) {
    e.preventDefault();
    router.push("/chat");
  }

  function handleClick(e: any) {
    e.preventDefault();
    isMobile && setOpenMobile(false);
  }

  return (
    <Button asChild className="w-full gap-2">
      <Link href="/chat" prefetch onClick={handleClick} onMouseDown={handleMouseDown}>
        <Plus className="h-4 w-4" />
        New Chat
      </Link>
    </Button>
  );
}
