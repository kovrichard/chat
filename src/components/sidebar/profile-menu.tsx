"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, FileText, MessageSquare } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { SignIn } from "./signin-button";
import { SignOut } from "./signout-button";

export default function ProfileMenu({
  authorized,
  hasCustomerId,
}: {
  authorized: boolean;
  hasCustomerId: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { data: billingPortalUrl } = useQuery({
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
  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!authorized) {
        return null;
      }

      const response = await fetch("/api/subscription");

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    },
  });

  return (
    <>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="flex items-center gap-2 h-9 px-2 py-1.5 text-muted-foreground text-sm">
        <MessageSquare className="shrink-0" size={16} />
        <span>Messages left: {subscription?.freeMessages || 10}</span>
      </div>
      {hasCustomerId && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0 h-10">
            <a
              href={billingPortalUrl}
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
      <DropdownMenuItem className="p-0 h-10">
        <a
          href="/privacy-policy"
          target="_blank"
          className="flex items-center gap-2 size-full px-2 py-1.5"
          onClick={() => isMobile && setOpenMobile(false)}
        >
          <FileText className="shrink-0" />
          <span>Privacy Policy</span>
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>{authorized ? <SignOut /> : <SignIn />}</DropdownMenuItem>
    </>
  );
}
