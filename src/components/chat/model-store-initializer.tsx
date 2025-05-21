"use client";

import { useModelStore } from "@/stores/model-store";
import type { Provider } from "@/types/provider";
import { useEffect } from "react";

export default function ModelStoreInitializer({
  providers,
}: {
  providers: Provider[];
}) {
  const { setModel, setTemporaryChat, setAvailableModels } = useModelStore();

  useEffect(() => {
    setAvailableModels(providers.flatMap((provider) => provider.models));
    setModel("4o-mini");
    setTemporaryChat(false);
  }, []);

  return null;
}
