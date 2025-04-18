"use client";

import { Button } from "@/components/ui/button";
import { readNotifications } from "@/lib/actions/notifications";
import { Notification } from "@prisma/client";

export default function MarkAllAsReadButton({
  notifications,
}: Readonly<{ notifications: Notification[] }>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-sm text-muted-foreground"
      onClick={() => readNotifications(notifications.map((n: Notification) => n.id))}
    >
      Mark all as read
    </Button>
  );
}
