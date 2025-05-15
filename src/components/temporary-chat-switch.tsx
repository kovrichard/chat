"use client";

import { useModelStore } from "@/stores/model-store";
import { MessageCircleDashed } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function TemporaryChatSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const { temporaryChat, setTemporaryChat } = useModelStore();

  function handleCheckedChange(checked: boolean) {
    if (pathname !== "/chat") {
      router.push("/chat");
    }
    setTemporaryChat(checked);
  }

  return (
    <div>
      <div className="flex px-3 py-2.5 items-center gap-2 text-sm justify-between bg-popover">
        <Label htmlFor="temporary-chat" className="flex items-center gap-2">
          <MessageCircleDashed size={16} />
          <p>Temporary chat</p>
        </Label>
        <Switch
          id="temporary-chat"
          checked={temporaryChat}
          onCheckedChange={handleCheckedChange}
        />
      </div>
    </div>
  );
}
