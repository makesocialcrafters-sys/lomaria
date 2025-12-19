import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "elegant";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          /* Base styles */
          "flex w-full font-display text-base text-foreground transition-all duration-500 ease-out",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          /* Variant styles */
          variant === "elegant"
            ? /* Wes Anderson elegant underlined style */
              "h-12 bg-transparent border-0 border-b border-primary/40 rounded-none px-0 placeholder:text-foreground/40 focus:border-primary/60 focus:outline-none focus-visible:ring-0"
            : /* Default bordered style */
              "h-12 rounded-md border border-primary/20 bg-background px-4 py-3 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };