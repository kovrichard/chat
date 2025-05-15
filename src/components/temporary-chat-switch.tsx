import { MessageCircleDashed } from "lucide-react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function TemporaryChatSwitch() {
  return (
    <div>
      <div className="flex px-3 py-2.5 items-center gap-2 text-sm justify-between bg-popover">
        <Label htmlFor="temporary-chat" className="flex items-center gap-2">
          <MessageCircleDashed size={16} />
          <p>Temporary chat</p>
        </Label>
        <Switch id="temporary-chat" />
      </div>
    </div>
  );
}
