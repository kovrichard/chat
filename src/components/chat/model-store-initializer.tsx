"use client";

import { useModelStore } from "@/stores/model-store";
import type { PublicProvider } from "@/types/provider";
import { useEffect } from "react";

export default function ModelStoreInitializer({
  providers,
}: {
  providers: PublicProvider[];
}) {
  const { setTemporaryChat, setAvailableModels } = useModelStore();

  useEffect(() => {
    setAvailableModels(providers.flatMap((provider) => provider.models));
    setTemporaryChat(false);
  }, []);

  return null;
}
