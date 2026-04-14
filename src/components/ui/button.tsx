import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "success" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" && "bg-ink text-white hover:bg-black",
        variant === "secondary" && "bg-sand text-ink hover:bg-clay/60",
        variant === "ghost" && "bg-transparent text-ink hover:bg-black/5",
        variant === "success" && "bg-success text-white hover:bg-success/90",
        variant === "danger" && "bg-danger text-white hover:bg-danger/90",
        className
      )}
      {...props}
    />
  );
}
