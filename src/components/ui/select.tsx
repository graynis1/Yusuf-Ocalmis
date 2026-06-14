import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Hafif native select — facet ve sıralama için yeterli, JS yükü minimal. */
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--elev)] px-3 pr-9 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] [&>option]:bg-[var(--elev)] [&>option]:text-ink",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
    </div>
  )
);
Select.displayName = "Select";

export { Select };
