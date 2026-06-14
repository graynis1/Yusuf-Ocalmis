"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createCategoryAction, deleteCategoryAction } from "@/server/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Cat = { id: string; name: string; path: string; parentId: string | null; productCount: number };

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [msg, setMsg] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const form = e.currentTarget;
    const res = await createCategoryAction({}, new FormData(form));
    setBusy(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else setMsg(res.error ?? "Hata");
  }

  async function onDelete(id: string) {
    const res = await deleteCategoryAction(id);
    if (!res.ok) setMsg(res.error ?? "Silinemedi");
    else router.refresh();
  }

  // path derinliğine göre girinti
  const sorted = [...categories].sort((a, b) => a.path.localeCompare(b.path));

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="flex flex-wrap items-end gap-2 rounded-lg border border-[var(--border)] bg-card p-4">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Yeni kategori adı</label>
          <Input name="name" required placeholder="Örn. Akıllı Saat" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Üst kategori</label>
          <Select name="parentId" className="w-56">
            <option value="">(Kök)</option>
            {sorted.map((c) => (
              <option key={c.id} value={c.id}>{c.path}</option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={busy}>Ekle</Button>
      </form>

      {msg && <p className="text-sm text-[var(--rise)]">{msg}</p>}

      <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)]">
        {sorted.map((c) => {
          const depth = c.path.split("/").length - 1;
          return (
            <li key={c.id} className="flex items-center justify-between p-3" style={{ paddingLeft: 12 + depth * 20 }}>
              <span className="text-sm">
                {c.name} <span className="text-xs text-[var(--muted)]">({c.productCount} ürün)</span>
              </span>
              <button onClick={() => onDelete(c.id)} className="text-[var(--muted)] hover:text-[var(--rise)]" aria-label="Sil">
                <Trash2 className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
