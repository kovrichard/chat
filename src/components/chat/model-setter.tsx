"use client";

import { useModelStore } from "@/stores/model-store";
import type { PublicModel } from "@/types/provider";
import { useEffect } from "react";

export default function ModelSetter({ model }: { model: PublicModel }) {
  const { setModel } = useModelStore();

  useEffect(() => {
    setModel(model.id);
  }, []);

  return null;
}
