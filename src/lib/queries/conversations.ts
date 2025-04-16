import {
  deleteConversation,
  saveConversation,
  saveConversationModel,
  updateConversationTitle,
} from "@/lib/actions/conversations";
import { PartialConversation } from "@/types/chat";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Message } from "ai";
import { deleteMessageChainAfter } from "../actions/messages";
import { processMessages } from "../message-processor";

const conversationKeys = {
  detail: (id: string) => ["conversations", id] as const,
  list: (page: number) => ["conversations", "list", page] as const,
};

export function useConversations(conversations: any, search?: string) {
  return useInfiniteQuery({
    queryKey: conversationKeys.list(1),
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams({
        page: pageParam.toString(),
        limit: "15",
        ...(search ? { search } : {}),
      });

      const response = await fetch(`/api/conversations?${searchParams.toString()}`);
      const data = await response.json();
      return {
        conversations: data.conversations,
        nextPage: data.hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    initialData: () => ({
      pages: [
        {
          conversations: conversations.conversations,
          nextPage: conversations.hasMore ? 1 : undefined,
        },
      ],
      pageParams: [1],
    }),
  });
}

export function useConversation(id: string, initialConversation?: any) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;

      const response = await fetch(`/api/conversations/${id}`);
      const data = await response.json();

      return {
        ...data,
        messages: processMessages(data.messages),
      };
    },
    initialData: () => {
      if (initialConversation) {
        return initialConversation;
      }
      return null;
    },
  });
}

export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messages,
    }: { conversationId: string; messages: Message[] }) =>
      updateConversationTitle(conversationId, messages),
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
        model: updatedConversation?.model,
      }));
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: string }) =>
      deleteConversation(conversationId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", "list"],
        type: "all",
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(conversationId),
      });
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
        createdAt: message.createdAt || new Date(),
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
      queryClient.invalidateQueries({ queryKey: ["conversations", "list"] });
    },
  });
}

export function useRegenerateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      conversationId,
    }: { messageId: string; conversationId: string }) =>
      deleteMessageChainAfter(messageId, conversationId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", "list"] });

      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(conversationId),
      });
    },
  });
}

export function useCreateConversationOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversation: PartialConversation) => {
      // This is a no-op since we're handling the actual creation in the chat endpoint
      return Promise.resolve(conversation);
    },
    onMutate: (newConversation) => {
      // Cancel any outgoing refetches without awaiting
      queryClient.cancelQueries({
        queryKey: conversationKeys.detail(newConversation.id),
      });

      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData(conversationKeys.list(1));

      // Optimistically update the conversation detail
      queryClient.setQueryData(
        conversationKeys.detail(newConversation.id),
        newConversation
      );

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
  });
}
