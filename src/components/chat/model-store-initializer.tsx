"use client";

import { useModelStore } from "@/stores/model-store";
import { useEffect } from "react";

export default function ModelStoreInitializer() {
  const { setModel } = useModelStore();

  useEffect(() => {
    setModel("4o-mini");
  }, []);

  return null;
}
