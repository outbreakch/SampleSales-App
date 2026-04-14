import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink outline-none ring-0 placeholder:text-stone focus:border-ink",
        className
      )}
      {...props}
    />
  );
}
