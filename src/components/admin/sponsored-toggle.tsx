"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toggleSponsoredAction } from "@/server/actions/admin-actions";

export function SponsoredToggle({ offerId, value }: { offerId: string; value: boolean }) {
  const router = useRouter();
  const [on, setOn] = React.useState(value);
  const [busy, setBusy] = React.useState(false);

  async function toggle() {
    setBusy(true);
    const next = !on;
    setOn(next);
    await toggleSponsoredAction(offerId, next);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      role="switch"
      aria-checked={on}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? "bg-[var(--save)]" : "bg-[var(--border)]"}`}
    >
      <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}
