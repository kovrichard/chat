"use client";

import { useModelStore } from "@/stores/model-store";
import { useEffect } from "react";

export default function ModelStoreSetter() {
  const { setModel } = useModelStore();

  useEffect(() => {
    setModel("gpt-4o-mini");
  }, []);

  return null;
}
