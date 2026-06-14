"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, FlaskConical, Plus } from "lucide-react";
import { saveFeedAction, testFeedAction, deleteFeedAction } from "@/server/actions/merchant-actions";
import { FEED_PRESETS } from "@/feeds/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type FeedRow = {
  id: string;
  name: string;
  type: string;
  url: string | null;
  enabled: boolean;
  lastStatus: string | null;
  itemCount: number;
};

export function FeedManager({ feeds, canManage }: { feeds: FeedRow[]; canManage: boolean }) {
  const router = useRouter();
  const [showForm, setShowForm] = React.useState(false);
  const [presetKey, setPresetKey] = React.useState(FEED_PRESETS[0].key);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"XML" | "CSV" | "JSON" | "GOOGLE_SHOPPING">("GOOGLE_SHOPPING");
  const [url, setUrl] = React.useState("");
  const [mapping, setMapping] = React.useState(JSON.stringify(FEED_PRESETS[0].mapping, null, 2));
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [preview, setPreview] = React.useState<unknown[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  function applyPreset(key: string) {
    const p = FEED_PRESETS.find((x) => x.key === key);
    if (!p) return;
    setPresetKey(key);
    setType(p.type as never);
    setMapping(JSON.stringify(p.mapping, null, 2));
    if (!name) setName(p.label);
  }

  async function onTest() {
    setBusy(true);
    setMsg(null);
    setPreview(null);
    const res = await testFeedAction(type, url, mapping);
    setBusy(false);
    if ("error" in res && res.error) setMsg({ kind: "err", text: res.error });
    else if ("preview" in res) {
      setPreview(res.preview as unknown[]);
      setMsg({ kind: "ok", text: `${(res.preview as unknown[]).length} kalem okundu.` });
    }
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const res = await saveFeedAction({}, fd);
    setBusy(false);
    if (res.ok) {
      setShowForm(false);
      setName("");
      setUrl("");
      setPreview(null);
      router.refresh();
    } else {
      setMsg({ kind: "err", text: res.error ?? "Kaydedilemedi." });
    }
  }

  async function onDelete(id: string) {
    await deleteFeedAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Feed'ler</h1>
        {canManage && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" /> Feed ekle
          </Button>
        )}
      </div>

      {!canManage && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-300">
          Mağazan onaylandıktan sonra feed bağlayabilirsin.
        </div>
      )}

      {feeds.length > 0 ? (
        <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)]">
          {feeds.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{f.name}</span>
                  <Badge variant="muted">{f.type}</Badge>
                  {f.lastStatus && (
                    <Badge variant={f.lastStatus === "SUCCESS" ? "save" : f.lastStatus === "FAILED" ? "rise" : "muted"}>
                      {f.lastStatus}
                    </Badge>
                  )}
                </div>
                <div className="mt-0.5 max-w-md truncate text-xs text-[var(--muted)]">{f.url}</div>
                <div className="text-xs text-[var(--muted)]">{f.itemCount} ürün</div>
              </div>
              <button onClick={() => onDelete(f.id)} className="text-[var(--muted)] hover:text-[var(--rise)]" aria-label="Sil">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
          Henüz feed bağlamadın.
        </p>
      )}

      {showForm && canManage && (
        <form onSubmit={onSave} className="animate-fade-up space-y-4 rounded-lg border border-[var(--border)] bg-card p-5">
          <h2 className="font-display text-lg font-bold">Yeni feed</h2>

          <div className="space-y-1.5">
            <Label>Hazır şablon</Label>
            <Select value={presetKey} onChange={(e) => applyPreset(e.target.value)}>
              {FEED_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </Select>
            <p className="text-xs text-[var(--muted)]">{FEED_PRESETS.find((p) => p.key === presetKey)?.note}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Feed adı</Label>
              <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Tip</Label>
              <Select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as never)}>
                <option value="GOOGLE_SHOPPING">Google Shopping</option>
                <option value="XML">XML</option>
                <option value="CSV">CSV</option>
                <option value="JSON">JSON</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url">Feed URL'i</Label>
            <Input id="url" name="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://magazan.com/feed.xml" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mappingConfig">Eşleme yapılandırması (JSON)</Label>
            <textarea
              id="mappingConfig"
              name="mappingConfig"
              value={mapping}
              onChange={(e) => setMapping(e.target.value)}
              rows={10}
              className="w-full rounded-md border border-[var(--border)] bg-white/5 p-3 font-mono text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
            />
            <p className="text-xs text-[var(--muted)]">Feed alanlarını kanonik şemaya eşle. "Feed'i test et" ile ilk kalemleri önizle.</p>
          </div>

          {msg && (
            <p className={`text-sm ${msg.kind === "ok" ? "text-[var(--save)]" : "text-[var(--rise)]"}`}>{msg.text}</p>
          )}

          {preview && preview.length > 0 && (
            <div className="max-h-48 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
              <pre className="text-xs">{JSON.stringify(preview.slice(0, 3), null, 2)}</pre>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onTest} disabled={busy || !url}>
              <FlaskConical className="size-4" /> Feed'i test et
            </Button>
            <Button type="submit" disabled={busy}>Kaydet</Button>
          </div>
        </form>
      )}
    </div>
  );
}
