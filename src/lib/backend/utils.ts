import { getModel } from "@/lib/providers";
import { Attachment, Message } from "ai";

export function filterMessages(messages: Message[], modelId: string) {
  const model = getModel(modelId);
  const imageSupport =
    model?.features?.some((feature) => feature.name === "Images") || false;
  const pdfSupport = model?.features?.some((feature) => feature.name === "PDFs") || false;

  return messages.map((message: Message) => ({
    ...message,
    experimental_attachments: filterUnsupportedAttachments(
      message.experimental_attachments || [],
      imageSupport,
      pdfSupport
    ),
  }));
}

function filterUnsupportedAttachments(
  attachments: Attachment[],
  imageSupport: boolean,
  pdfSupport: boolean
) {
  return attachments.filter((attachment) => {
    if (imageSupport && attachment.contentType?.startsWith("image/")) return true;
    if (pdfSupport && attachment.contentType?.startsWith("application/pdf")) return true;
    return false;
  });
}
