import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
        accent: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
        success: "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
        warning: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
        danger: "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]",
        info: "bg-[var(--color-info-subtle)] text-[var(--color-info)]",
        purple: "bg-[var(--color-purple-subtle)] text-[var(--color-purple)]",
        muted: "bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]",
        sixsense: "bg-[var(--color-sixsense)]/10 text-[var(--color-sixsense)]",
        salesforce: "bg-[var(--color-salesforce)]/10 text-[var(--color-salesforce)]",
        gong: "bg-[var(--color-gong)]/10 text-[var(--color-gong)]",
        gainsight: "bg-[var(--color-gainsight)]/10 text-[var(--color-gainsight)]",
      },
      size: {
        sm: "px-2 py-0.5 text-[length:var(--font-size-xs)]",
        md: "px-3 py-1 text-[length:var(--font-size-sm)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

function Badge({ className, variant, size, dot, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
