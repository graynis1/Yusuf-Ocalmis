"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { setMerchantStatusAction, approveSubscriptionAction } from "@/server/actions/admin-actions";
import { Button } from "@/components/ui/button";

export function MerchantActions({
  merchantId,
  status,
  hasPendingSub,
}: {
  merchantId: string;
  status: string;
  hasPendingSub: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    await fn();
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" && (
        <Button size="sm" variant="save" disabled={busy} onClick={() => run(() => setMerchantStatusAction(merchantId, "APPROVED"))}>
          Onayla
        </Button>
      )}
      {status !== "SUSPENDED" && (
        <Button size="sm" variant="destructive" disabled={busy} onClick={() => run(() => setMerchantStatusAction(merchantId, "SUSPENDED"))}>
          Askıya al
        </Button>
      )}
      {status === "SUSPENDED" && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => setMerchantStatusAction(merchantId, "PENDING"))}>
          Beklemeye al
        </Button>
      )}
      {hasPendingSub && (
        <Button size="sm" disabled={busy} onClick={() => run(() => approveSubscriptionAction(merchantId))}>
          Aboneliği onayla
        </Button>
      )}
    </div>
  );
}
