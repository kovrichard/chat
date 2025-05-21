"use client";

import { useModelStore } from "@/stores/model-store";
import type { Provider } from "@/types/provider";
import { useEffect } from "react";

export default function ModelStoreInitializer({
  providers,
}: {
  providers: Provider[];
}) {
  const { setTemporaryChat, setAvailableModels } = useModelStore();

  useEffect(() => {
    setAvailableModels(providers.flatMap((provider) => provider.models));
    setTemporaryChat(false);
  }, []);

  return null;
}
