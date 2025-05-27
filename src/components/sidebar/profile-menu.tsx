"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, FileText, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
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
  stripeConfigured,
}: {
  authorized: boolean;
  hasCustomerId: boolean;
  stripeConfigured: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { data: billingPortalUrl } = useQuery({
    queryKey: ["billing-portal-url"],
    queryFn: async () => {
      if (!stripeConfigured || !hasCustomerId) {
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
      if (!stripeConfigured || !authorized) {
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
      {stripeConfigured && subscription && (
        <div className="flex items-center gap-2 h-9 px-2 py-1.5 text-muted-foreground text-sm">
          <MessageSquare className="shrink-0" size={16} />
          <span>Messages left: {subscription.freeMessages}</span>
        </div>
      )}
      {stripeConfigured && hasCustomerId && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0 h-10 cursor-pointer" asChild>
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
      {authorized && (
        <>
          <DropdownMenuItem className="p-0 h-10 cursor-pointer" asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 size-full px-2 py-1.5"
              onClick={() => isMobile && setOpenMobile(false)}
            >
              <Settings className="shrink-0" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
