import { MessagesList } from "@/components/message-list";
import MessagesScrollArea from "@/components/messages-scroll-area";
import { getConversation } from "@/lib/dao/conversations";
import { getMessages } from "@/lib/dao/messages";
import { getUserIdFromSession } from "@/lib/dao/users";
import { processMessages } from "@/lib/message-processor";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await getUserIdFromSession();

  const { id } = await params;

  const conversationData = getConversation(id);
  const messagesData = getMessages(id, 1, 10);
  const [conversation, messages] = await Promise.all([conversationData, messagesData]);

  const formattedMessages = processMessages(messages.messages);

  return (
    <MessagesScrollArea className="relative h-[calc(100svh-114px)] md:h-[calc(100svh-142px)]">
      <div className="absolute top-0 left-0 right-0 max-w-5xl mx-auto h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 rounded-t-xl" />
      <MessagesList
        id={id}
        initialConversation={conversation}
        initialMessages={formattedMessages}
      />
    </MessagesScrollArea>
  );
}
