"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateUserMemoryEnabled } from "@/lib/actions/users";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function MemoryForm({
  memory,
  memoryEnabled,
}: {
  memory?: string;
  memoryEnabled: boolean;
}) {
  const [content, setContent] = useState(memory ?? "");
  const [enabled, setEnabled] = useState(memoryEnabled);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    updateUserMemoryEnabled(enabled).then((message: string) => {
      toast(message, {
        description: "Your memory settings have been updated.",
      });
    });
  }, [enabled]);

  return (
    <div className="flex flex-col gap-4 items-start">
      <h4 className="text-sm font-medium">Memory</h4>
      <div className="flex items-center gap-2">
        <Switch id="memory" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="memory">Enable memory</Label>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          If memory is enabled, the model will store information about you and will use it
          to improve the quality of its responses.
        </p>
        <p className="text-sm text-muted-foreground">
          {enabled ? "You can edit the memory here manually." : "Enable memory to edit."}
        </p>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!enabled}
        rows={8}
        className="resize-none"
      />
      <Button className="px-5" disabled={!enabled}>
        Save
      </Button>
    </div>
  );
}
