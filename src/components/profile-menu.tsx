"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { SignOut } from "./signout-button";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export default function ProfileMenu({
  hasCustomerId,
}: {
  hasCustomerId: boolean;
}) {
  const { data } = useQuery({
    queryKey: ["billing-portal-url"],
    queryFn: async () => {
      if (!hasCustomerId) {
        return null;
      }

      const response = await fetch("/api/subscription/billing-portal");
      const data = await response.json();
      return data.url;
    },
  });

  return (
    <>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {hasCustomerId && (
        <DropdownMenuItem className="p-0 h-10">
          <a
            href={data}
            target="_blank"
            className="flex items-center gap-2 size-full px-2 py-1.5"
          >
            <CreditCard className="shrink-0" size={24} />
            <span>Billing</span>
          </a>
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <SignOut />
      </DropdownMenuItem>
    </>
  );
}
