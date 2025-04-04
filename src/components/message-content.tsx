import { Message } from "ai";
import { Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ThinkingIndicator } from "./thinking-indicator";
import { Button } from "./ui/button";

export function MessageContent({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div
        className="rounded-lg p-4 border whitespace-pre-wrap break-words bg-card text-card-foreground"
        data-role="user"
        style={{ wordBreak: "break-word" }}
      >
        {message.content}
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <div className="flex flex-col items-start gap-4" data-role="assistant">
        {message.parts?.[0]?.type === "reasoning" && (
          <ThinkingIndicator reasoning={message.parts[0].reasoning} />
        )}
        <div className="flex flex-col items-start gap-1">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <div className="relative my-2">
                    <div className="overflow-x-auto group/code">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 size-8 opacity-0 group-hover/code:opacity-100 transition-opacity duration-100"
                        onClick={() => navigator.clipboard.writeText(String(children))}
                      >
                        <Copy className="size-4" />
                      </Button>
                      <SyntaxHighlighter
                        // @ts-ignore
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md border border-zinc-700"
                        customStyle={{
                          margin: 0,
                          borderRadius: "0.375rem",
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                ) : (
                  <code className="bg-zinc-800 px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-6 mb-2">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-6 mb-2">{children}</ol>;
              },
              li({ children }) {
                return <li className="mb-1">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold mb-2 mt-4">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-md font-bold mb-2 mt-3">{children}</h3>;
              },
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    className="text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
}
