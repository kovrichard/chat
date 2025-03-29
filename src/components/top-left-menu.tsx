import { cn } from "@/lib/utils";
import { SidebarTrigger } from "./ui/sidebar";

export function TopLeftMenu() {
  return (
    <div className={cn("fixed left-0 grid place-items-center flex-1 pl-4 pt-3.5 z-10")}>
      <SidebarTrigger />
    </div>
  );
}
