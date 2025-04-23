import ExampleButton from "@/components/chat/example-button";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import dynamic from "next/dynamic";
const LazyIntroDialog = dynamic(() => import("@/components/chat/intro-dialog"));

const examples = [
  "105 degrees Fahrenheit to Celsius ",
  "Where do llamas live naturally? ",
  "What is the smallest country in Africa? ",
  "How can you help me? ",
];

export default function ChatPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-4">
        <h1 className="text-4xl font-bold">Chat with me</h1>
        <LazyIntroDialog />
        <ul className="flex flex-col">
          {examples.map((example) => (
            <li
              key={example}
              className="border-b py-1.5 last:border-b-0 text-muted-foreground"
            >
              <ExampleButton example={example} />
            </li>
          ))}
        </ul>
        <ModelStoreInitializer />
      </div>
    </div>
  );
}
