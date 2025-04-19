import "server-only";

import { uploadFile } from "@/lib/aws/s3";
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { Attachment, Message, UIMessage } from "ai";
import { v4 as uuidv4 } from "uuid";

type ReasoningDetail =
  | {
      type: "text";
      text: string;
      signature?: string;
    }
  | {
      type: "redacted";
      data: string;
    };

export type OnFinishResult = {
  text: string;
  reasoning?: string;
  reasoningDetails?: ReasoningDetail[];
};

export async function saveMessage(message: Message | UIMessage, conversationId: string) {
  const userId = await getUserIdFromSession();

  const newMessage = await prisma.message.create({
    data: {
      ...message,
      id: uuidv4(),
      parts: JSON.stringify(message.parts),
      toolInvocations: JSON.stringify(message.toolInvocations),
      conversationId,
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversationId,
      userId,
    },
    data: {
      lastMessageAt: new Date(),
    },
  });

  return newMessage;
}

export async function uploadAttachments(
  messageAttachments: Attachment[],
  userId: number,
  conversationId: string
) {
  // Validate file sizes upfront before starting any uploads
  for (const attachment of messageAttachments) {
    const base64Data = attachment.url.split(",")[1];
    const decodedData = Buffer.from(base64Data, "base64");
    if (decodedData.length > 25 * 1024 * 1024) {
      throw new Error(`File "${attachment.name}" exceeds the maximum size limit of 25MB`);
    }
  }

  const attachments = await Promise.all(
    messageAttachments.map(async (attachment: Attachment) => {
      const base64Data = attachment.url.split(",")[1];
      const decodedData = Buffer.from(base64Data, "base64");

      const blob = new Blob([decodedData], { type: attachment.contentType });

      const fileId = uuidv4();
      const filePath = `${userId}/${conversationId}/${fileId}`;

      const file = new File([blob], attachment.name || fileId, {
        type: attachment.contentType,
      });

      await uploadFile(file, filePath);
      return {
        name: attachment.name || fileId,
        contentType: attachment.contentType,
        url: filePath,
      };
    })
  );

  return attachments;
}
