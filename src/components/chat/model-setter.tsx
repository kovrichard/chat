"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import { useModelStore } from "@/stores/model-store";
import type { PublicModel } from "@/types/provider";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ModelSetter({ model }: { model: PublicModel }) {
  const { setModel } = useModelStore();
  const { setStableId } = useChatContext();

  useEffect(() => {
    setModel(model.id);
    const stableId = uuidv4();
    setStableId(stableId);
  }, []);

  return null;
}
