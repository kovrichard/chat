import { Message } from "ai";
import { Copy } from "lucide-react";
import { marked } from "marked";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { xonokai } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ThinkingIndicator } from "./thinking-indicator";
import { Button } from "./ui/button";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedSyntaxHighlighter = memo(
  ({
    language,
    children,
    ...props
  }: {
    language: string;
    children: string;
  }) => {
    return (
      <SyntaxHighlighter
        style={xonokai}
        language={language}
        PreTag="div"
        className="rounded-md border border-zinc-700 p-4"
        customStyle={{
          margin: 0,
          borderRadius: "0.375rem",
        }}
        {...props}
      >
        {children}
      </SyntaxHighlighter>
    );
  },
  (prevProps, nextProps) =>
    prevProps.language === nextProps.language && prevProps.children === nextProps.children
);

const CodeBlock = memo(
  ({ language, children }: { language: string; children: string }) => {
    const [isRendered, setIsRendered] = useState(false);
    const codeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsRendered(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      if (codeRef.current) {
        observer.observe(codeRef.current);
      }
      return () => observer.disconnect();
    }, []);

    return (
      <div className="relative my-2" ref={codeRef}>
        <div className="overflow-x-auto group/code">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 size-8 opacity-0 group-hover/code:opacity-100 transition-opacity duration-100 z-10"
            onClick={() => navigator.clipboard.writeText(String(children))}
          >
            <Copy className="size-4" />
          </Button>
          {isRendered ? (
            <MemoizedSyntaxHighlighter language={language}>
              {children.replace(/\n$/, "")}
            </MemoizedSyntaxHighlighter>
          ) : (
            <div className="bg-zinc-800 p-[15px] rounded-md border text-[14px] border-[rgb(225,225,232)] text-zinc-300 whitespace-pre-wrap overflow-auto">
              <code className="whitespace-pre-wrap">{children}</code>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <CodeBlock language={match[1]}>{String(children)}</CodeBlock>
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
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  }
);

export function MessageContent({ message }: { message: Message }) {
  const blocks = useMemo(
    () => parseMarkdownIntoBlocks(message.content),
    [message.content]
  );

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
    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock key={`${message.id}-block-${index}`} content={block} />
    ));
  }
}
