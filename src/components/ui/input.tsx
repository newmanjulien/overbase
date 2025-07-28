import * as React from "react";

import { cn } from "../../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input2 bg-background2 px-3 py-2 text-base ring-offset-background2 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground2 placeholder:text-muted-foreground2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&[data-title]]:text-2xl",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
