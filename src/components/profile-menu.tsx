"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, MessageCircle, MessageSquare } from "lucide-react";
import { SignOut } from "./signout-button";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export default function ProfileMenu({
  hasCustomerId,
  freeMessages,
}: {
  hasCustomerId: boolean;
  freeMessages: number;
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
      {hasCustomerId && (
        <>
          <DropdownMenuSeparator />
          <div className="flex items-center gap-2 h-9 px-2 py-1.5 text-muted-foreground text-sm">
            <MessageSquare className="shrink-0" size={16} />
            <span>Messages left: {freeMessages}</span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0 h-10">
            <a
              href={data}
              target="_blank"
              className="flex items-center gap-2 size-full px-2 py-1.5"
            >
              <CreditCard className="shrink-0" />
              <span>Billing</span>
            </a>
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <SignOut />
      </DropdownMenuItem>
    </>
  );
}
