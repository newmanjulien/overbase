import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary2 text-primary-foreground2 hover:bg-primary2/80",
        secondary:
          "border-transparent bg-secondary2 text-secondary-foreground2 hover:bg-secondary2/80",
        destructive:
          "border-transparent bg-destructive2 text-destructive-foreground2 hover:bg-destructive2/80",
        outline: "text-foreground2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
