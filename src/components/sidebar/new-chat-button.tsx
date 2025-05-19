"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import { FastLink } from "../fast-link";

export function NewChatButton() {
  const { isMobile, setOpenMobile } = useSidebar();

  function handleClick() {
    isMobile && setOpenMobile(false);
  }

  return (
    <Button asChild className="w-full gap-2">
      <FastLink href="/chat" prefetch onClick={handleClick}>
        <Plus className="h-4 w-4" />
        New Chat
      </FastLink>
    </Button>
  );
}
