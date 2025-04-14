import { MessagesList } from "@/components/message-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getConversation } from "@/lib/dao/conversations";
import { processMessages } from "@/lib/message-processor";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await getConversation(id);
  const formattedConversation = {
    ...conversation,
    messages: processMessages(conversation?.messages || []),
  };

  return (
    <ScrollArea className="relative h-[calc(100svh-114px)] md:h-[calc(100svh-142px)]">
      <div className="absolute top-0 left-0 right-0 max-w-5xl mx-auto h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 rounded-t-xl" />
      <MessagesList id={id} initialConversation={formattedConversation} />
    </ScrollArea>
  );
}
