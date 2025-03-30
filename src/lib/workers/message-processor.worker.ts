interface Message {
  content?: string;
  reasoning?: string;
  signature?: string;
}

interface ProcessedMessage {
  content?: string;
  reasoning?: string;
  signature?: string;
  parts: Array<{
    type: "text" | "reasoning";
    text?: string;
    reasoning?: string;
    details?: Array<{
      type: "text";
      text: string;
      signature: string;
    }>;
  }>;
}

function processMessage(message: Message): ProcessedMessage {
  const parts: ProcessedMessage["parts"] = [];

  if (message.reasoning) {
    const details: ProcessedMessage["parts"][0]["details"] = [];
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
      details,
    });
  }

  if (message.content) {
    parts.push({
      type: "text",
      text: message.content,
    });
  }

  return {
    ...message,
    parts,
  };
}

self.onmessage = (e) => {
  const messages: Message[] = e.data;
  const processedMessages = messages.map(processMessage);
  self.postMessage(processedMessages);
};
