import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  grow?: boolean; // <--- NEW prop
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, grow = false, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(
      ref,
      () => innerRef.current as HTMLTextAreaElement
    );

    React.useEffect(() => {
      if (!grow || !innerRef.current) return;
      const el = innerRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }, [props.value, grow]);

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      if (grow) {
        const el = event.currentTarget;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
      }
      props.onInput?.(event);
    };

    return (
      <textarea
        ref={innerRef}
        onInput={handleInput}
        className={cn(
          "flex w-full rounded-xl border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          grow ? "resize-none overflow-hidden" : "resize-y",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
