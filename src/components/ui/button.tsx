import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          {
            "bg-terracotta text-white shadow-sm hover:bg-terracotta/90 hover:shadow-terracotta/20": variant === "default",
            "border-2 border-terracotta bg-surface hover:bg-surface/80 text-terracotta shadow-sm": variant === "outline",
            "hover:bg-surface text-foreground": variant === "ghost",
            "text-terracotta underline-offset-4 hover:underline": variant === "link",
            "bg-terracotta text-white shadow-sm hover:bg-terracotta/80": variant === "destructive",
            "h-10 px-5 py-2": size === "default",
            "h-8 px-4 text-xs": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
