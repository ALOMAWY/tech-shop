import { cn } from "@/lib/cn";

export function TraceDivider({ className }: { className?: string }) {
  return <hr aria-hidden className={cn("trace", className)} />;
}
