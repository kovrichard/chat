"use client";

import { debounce } from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";
import { useCallback, useEffect, useState } from "react";
import { Input } from "../ui/input";

export function SearchField() {
  const [search, setSearch] = useState("");
  const { setSearchQuery } = useSearchStore();
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearchQuery(search);
  }, [search, debouncedSetSearchQuery]);

  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
