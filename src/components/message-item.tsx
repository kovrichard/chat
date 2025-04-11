import { useChatContext } from "@/lib/contexts/chat-context";
import { useRegenerateMessage } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { Message } from "ai";
import { Copy, RefreshCw } from "lucide-react";
import { MessageContent } from "./message-content";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function MessageItem({ message }: { message: Message }) {
  const regenerateMessage = useRegenerateMessage();
  const { id, reload } = useChatContext();

  const handleRegenerateMessage = async () => {
    const a = false;
    if (a) {
      await regenerateMessage.mutateAsync({
        messageId: message.id,
        conversationId: id,
      });
      reload({ body: { retry: true } });
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1 group",
        message.role === "user" ? "ml-auto max-w-[60%] items-end" : "mr-auto max-w-full"
      )}
    >
      <MessageContent message={message} />
      <div
        className={cn(
          "flex items-start gap-1 text-muted-foreground",
          message.role === "user" && "flex-row-reverse"
        )}
      >
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 p-0"
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                <Copy
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Copy message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 p-0">
                <RefreshCw
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                  onClick={handleRegenerateMessage}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Regenerate response</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
