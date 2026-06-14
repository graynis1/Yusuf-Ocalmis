import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-white/5 text-ink border border-[var(--border)]",
        brand: "bg-[var(--brand)]/15 text-[var(--brand)] border border-[var(--brand)]/30",
        save: "bg-[var(--save)]/15 text-[var(--save)] border border-[var(--save)]/30",
        rise: "bg-[var(--rise)]/15 text-[var(--rise)] border border-[var(--rise)]/30",
        sponsored:
          "bg-amber-400/15 text-amber-300 border border-amber-400/30 backdrop-blur",
        muted: "bg-white/5 text-[var(--muted)] border border-[var(--border)]",
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
