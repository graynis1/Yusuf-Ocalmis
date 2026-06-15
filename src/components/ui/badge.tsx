import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-[var(--surface)] text-ink border border-[var(--border)]",
        brand: "bg-[var(--brand)]/10 text-[var(--brand)]",
        save: "bg-[var(--save)]/10 text-[var(--save)]",
        rise: "bg-[var(--rise)]/10 text-[var(--rise)]",
        sponsored: "bg-amber-100 text-amber-700",
        muted: "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
