"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { useChatContext } from "@/lib/contexts/chat-context";

export function ChangeDetector() {
  const params = useParams();
  const { setAcademic } = useChatContext();

  useEffect(() => {
    setAcademic(false);
  }, [params.id]);

  return null;
}
