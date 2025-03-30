import {
  saveConversation,
  saveConversationModel,
  saveConversationTitle,
} from "@/lib/actions/conversations";
import { PartialConversation } from "@/types/chat";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Message } from "ai";
import { useMessageProcessor } from "../hooks/use-message-processor";

const conversationKeys = {
  detail: (id: string) => ["conversations", id] as const,
  list: (page: number) => ["conversations", "list", page] as const,
};

export function useConversations(page = 1) {
  return useInfiniteQuery({
    queryKey: conversationKeys.list(page),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/conversations?page=${pageParam}&limit=15`);
      const data = await response.json();
      return {
        conversations: data.conversations,
        nextPage: data.hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}

export function useConversation(id: string) {
  const { processMessages } = useMessageProcessor();

  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${id}`);
      const data = await response.json();

      // Process messages in Web Worker
      const processedMessages = await processMessages(data.messages);

      return {
        ...data,
        messages: processedMessages,
      };
    },
  });
}

export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, title }: { conversationId: string; title: string }) =>
      saveConversationTitle(conversationId, title),
    onSuccess: (updatedConversation) => {
      // Update the conversation in all pages of the infinite query
      queryClient.setQueryData(conversationKeys.list(1), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            conversations: page.conversations.map((conv: PartialConversation) =>
              conv.id === updatedConversation.id
                ? { ...conv, title: updatedConversation.title }
                : conv
            ),
          })),
        };
      });
    },
  });
}

export function useUpdateConversationModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, model }: { conversationId: string; model: string }) =>
      saveConversationModel(conversationId, model),
    onSuccess: (updatedConversation, { conversationId }) => {
      queryClient.setQueryData(conversationKeys.detail(conversationId), (old: any) => ({
        ...old,
        model: updatedConversation.model,
      }));
    },
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      message,
      conversationId,
    }: {
      message: Message;
      conversationId: string;
    }) => {
      // Optimistically update the cache
      const optimisticMessage = {
        ...message,
        id: message.id,
        createdAt: message.createdAt,
      };

      // Update conversation detail cache
      queryClient.setQueryData(conversationKeys.detail(conversationId), (old: any) => ({
        ...old,
        messages: [...(old.messages || []), optimisticMessage],
      }));

      // Update conversation list cache
      queryClient.setQueryData(conversationKeys.list(1), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            conversations: page.conversations.map((conv: PartialConversation) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: [...(conv.messages || []), optimisticMessage],
                    lastMessageAt: optimisticMessage.createdAt,
                  }
                : conv
            ),
          })),
        };
      });

      return optimisticMessage;
    },
    onError: (_, { conversationId }) => {
      // Revert optimistic updates on error
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.list(1) });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversation: PartialConversation) => saveConversation(conversation),
    onMutate: async (newConversation) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: conversationKeys.detail(newConversation.id),
      });

      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData(conversationKeys.list(1));

      // Optimistically update the conversation detail
      queryClient.setQueryData(
        conversationKeys.detail(newConversation.id),
        newConversation
      );

      // Optimistically update the conversation list
      queryClient.setQueryData(conversationKeys.list(1), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            {
              conversations: [newConversation, ...(old.pages[0]?.conversations || [])],
            },
            ...old.pages.slice(1),
          ],
        };
      });

      return { previousConversations };
    },
    onError: (_err, newConversation, context) => {
      // Revert optimistic updates on error
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.list(1), context.previousConversations);
      }
      queryClient.removeQueries({
        queryKey: conversationKeys.detail(newConversation.id),
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: conversationKeys.list(1) });
    },
  });
}
