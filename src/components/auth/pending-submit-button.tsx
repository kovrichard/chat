import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { Button, ButtonProps } from "../ui/button";
import LastUsedIndicator from "./last-used-indicator";

export default function PendingSubmitButton({
  isPending,
  text,
  className,
  ...props
}: Readonly<
  ButtonProps & {
    isPending: boolean;
    text: string;
  }
>) {
  return (
    <Button disabled={isPending} className={cn("relative", className)} {...props}>
      {isPending ? <LoaderCircle className="animate-spin" size={18} /> : text}
      <LastUsedIndicator provider="password" />
    </Button>
  );
}
