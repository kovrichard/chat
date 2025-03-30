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
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () =>
      fetch(`/api/conversations/${id}`)
        .then((res) => res.json())
        .then((data) => {
          const messages = data.messages.map((message: any) => {
            let parts = [];
            if (message.reasoning) {
              let details = [];
              if (message.signature) {
                details.push({
                  type: "text",
                  text: message.reasoning,
                  signature: message.signature,
                });
              }

              parts.push({
                type: "reasoning",
                reasoning: message.reasoning,
                details: details,
              });
            }

            if (message.content) {
              parts.push({
                type: "text",
                text: message.content,
              });
            }
            message.parts = parts;

            return message;
          });

          return {
            ...data,
            messages: messages,
          };
        }),
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
    }: {
      message: Message;
      conversationId: string;
    }) => {
      // Just return the message for optimistic updates
      return message;
    },
    onSuccess: (message, { conversationId }) => {
      // Update the conversation query to add the new message
      queryClient.setQueryData(conversationKeys.detail(conversationId), (old: any) => ({
        ...old,
        messages: [...(old.messages || []), message],
      }));

      // Update the conversation in the list cache
      queryClient.setQueryData(conversationKeys.list(1), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            conversations: page.conversations.map((conv: PartialConversation) =>
              conv.id === conversationId
                ? { ...conv, messages: [...(conv.messages || []), message] }
                : conv
            ),
          })),
        };
      });
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

      queryClient.setQueryData(
        conversationKeys.detail(newConversation.id),
        newConversation
      );

      // Return a context object with the snapshotted value
      return { previousConversations };
    },
    onError: (_err, newConversation, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.list(1), context.previousConversations);
      }
      queryClient.removeQueries({
        queryKey: conversationKeys.detail(newConversation.id),
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: conversationKeys.list(1) });
    },
  });
}
