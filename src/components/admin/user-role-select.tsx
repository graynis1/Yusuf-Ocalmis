"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { setUserRoleAction } from "@/server/actions/admin-actions";
import { Select } from "@/components/ui/select";

export function UserRoleSelect({ userId, role }: { userId: string; role: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  return (
    <Select
      value={role}
      disabled={busy}
      className="w-36"
      onChange={async (e) => {
        setBusy(true);
        await setUserRoleAction(userId, e.target.value as "USER" | "MERCHANT" | "ADMIN");
        setBusy(false);
        router.refresh();
      }}
    >
      <option value="USER">Kullanıcı</option>
      <option value="MERCHANT">Satıcı</option>
      <option value="ADMIN">Admin</option>
    </Select>
  );
}
