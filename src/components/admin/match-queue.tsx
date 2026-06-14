"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X, Plus, Keyboard } from "lucide-react";
import { mergeMatchAction, newProductMatchAction, rejectMatchAction } from "@/server/actions/admin-actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ReviewItem = {
  reviewId: string;
  offerId: string;
  offerTitle: string;
  offerPrice: number;
  offerImage: string | null;
  merchantName: string;
  confidence: number;
  candidates: { productId: string; score: number; title: string; imageUrl: string | null; lowestPrice: number | null }[];
};

export function MatchQueue({ items }: { items: ReviewItem[] }) {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState(0);
  const [busy, setBusy] = React.useState(false);

  const current = items[index];

  const advance = React.useCallback(() => {
    setSelected(0);
    if (index + 1 >= items.length) router.refresh();
    else setIndex((i) => i + 1);
  }, [index, items.length, router]);

  const doMerge = React.useCallback(
    async (candidateIdx: number) => {
      if (!current || busy) return;
      const cand = current.candidates[candidateIdx];
      if (!cand) return;
      setBusy(true);
      await mergeMatchAction(current.reviewId, current.offerId, cand.productId);
      setBusy(false);
      advance();
    },
    [current, busy, advance]
  );

  const doNew = React.useCallback(async () => {
    if (!current || busy) return;
    setBusy(true);
    await newProductMatchAction(current.reviewId, current.offerId);
    setBusy(false);
    advance();
  }, [current, busy, advance]);

  const doReject = React.useCallback(async () => {
    if (!current || busy) return;
    setBusy(true);
    await rejectMatchAction(current.reviewId);
    setBusy(false);
    advance();
  }, [current, busy, advance]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, current.candidates.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key.toLowerCase() === "m" || e.key === "Enter") {
        e.preventDefault();
        doMerge(selected);
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        doNew();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        doReject();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, selected, doMerge, doNew, doReject]);

  if (!current) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center text-[var(--muted)]">
        Eşleştirme kuyruğu boş. Tüm belirsiz teklifler incelendi. 🎉
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">
          {index + 1} / {items.length} inceleniyor
        </p>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <Keyboard className="size-4" />
          <span>↑↓ seç · <kbd className="rounded border px-1">M</kbd> birleştir · <kbd className="rounded border px-1">N</kbd> yeni · <kbd className="rounded border px-1">R</kbd> reddet</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sol: gelen teklif */}
        <div className="rounded-lg border-2 border-[var(--brand)]/30 bg-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Gelen teklif</span>
          <div className="mt-3 flex gap-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded border border-[var(--border)] bg-white">
              {current.offerImage && <Image src={current.offerImage} alt="" fill className="object-contain p-1" />}
            </div>
            <div>
              <p className="font-medium">{current.offerTitle}</p>
              <p className="tabular mt-1 font-bold">{formatPrice(current.offerPrice)}</p>
              <p className="text-sm text-[var(--muted)]">{current.merchantName}</p>
              <Badge variant="muted" className="mt-1">Güven: {(current.confidence * 100).toFixed(0)}%</Badge>
            </div>
          </div>
          <Button onClick={doNew} variant="outline" className="mt-4 w-full" disabled={busy}>
            <Plus className="size-4" /> Yeni ürün olarak ekle (N)
          </Button>
          <Button onClick={doReject} variant="ghost" className="mt-2 w-full text-[var(--rise)]" disabled={busy}>
            <X className="size-4" /> Reddet (R)
          </Button>
        </div>

        {/* Sağ: aday ürünler */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Aday ürünler</span>
          <ul className="mt-3 space-y-2">
            {current.candidates.map((c, i) => (
              <li key={c.productId}>
                <button
                  onClick={() => doMerge(i)}
                  onMouseEnter={() => setSelected(i)}
                  disabled={busy}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selected === i ? "border-[var(--save)] bg-[var(--save)]/5" : "border-[var(--border)] hover:bg-[var(--surface)]"
                  }`}
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded border border-[var(--border)] bg-white">
                    {c.imageUrl && <Image src={c.imageUrl} alt="" fill className="object-contain p-1" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{c.title}</p>
                    <p className="tabular text-xs text-[var(--muted)]">{formatPrice(c.lowestPrice)}</p>
                  </div>
                  <Badge variant={c.score >= 0.5 ? "save" : "muted"}>{(c.score * 100).toFixed(0)}%</Badge>
                  {selected === i && <Check className="size-4 text-[var(--save)]" />}
                </button>
              </li>
            ))}
            {current.candidates.length === 0 && (
              <li className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                Aday yok. Yeni ürün olarak eklemen önerilir.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
