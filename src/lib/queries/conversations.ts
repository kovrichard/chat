import {
  deleteConversation,
  saveConversation,
  saveConversationModel,
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

export const conversationKeys = {
  detail: (id: string) => ["conversations", id] as const,
  list: (search?: string) => {
    const keys = ["conversations", "list"];
    if (search) {
      keys.push(search);
    }
    return keys;
  },
};

export function useConversations(conversations: any, search?: string) {
  return useInfiniteQuery({
    queryKey: conversationKeys.list(search),
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
    initialData: !search
      ? () => ({
          pages: [
            {
              conversations: conversations.conversations,
              nextPage: conversations.hasMore ? 1 : undefined,
            },
          ],
          pageParams: [1],
        })
      : undefined,
    placeholderData: (previousData) => previousData,
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
      // Update all conversation list caches (including filtered ones)
      const queries = queryClient.getQueriesData({ queryKey: ["conversations", "list"] });
      queries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => ({
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            conversations: page.conversations.filter(
              (conv: PartialConversation) => conv.id !== conversationId
            ),
          })),
        }));
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

      // Update all conversation list caches (including filtered ones)
      const queries = queryClient.getQueriesData({ queryKey: ["conversations", "list"] });
      queries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
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
      });

      return optimisticMessage;
    },
    onError: (_, { conversationId }) => {
      // Revert optimistic updates on error
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
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
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });

      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(conversationId),
      });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversation: PartialConversation) => saveConversation(conversation),
    onSuccess: (newConversation) => {
      if (newConversation) {
        // Update conversation detail
        queryClient.setQueryData(
          conversationKeys.detail(newConversation.id),
          newConversation
        );

        // Get all conversation list queries
        const queries = queryClient.getQueriesData({
          queryKey: ["conversations", "list"],
        });
        queries.forEach(([queryKey]) => {
          // Only update the unfiltered list optimistically
          if (queryKey.length === 2) {
            // ["conversations", "list"]
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return old;
              return {
                ...old,
                pages: [
                  {
                    conversations: [
                      newConversation,
                      ...(old.pages[0]?.conversations || []),
                    ],
                  },
                  ...old.pages.slice(1),
                ],
              };
            });
          } else {
            // Invalidate filtered queries to trigger a refetch
            queryClient.invalidateQueries({ queryKey });
          }
        });
      }
    },
    onError: (error, newConversation) => {
      console.error("Error creating conversation:", error);
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(newConversation.id),
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    },
  });
}
