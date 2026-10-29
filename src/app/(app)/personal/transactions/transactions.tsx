"use client";

import { Check, ChevronDown, Download, Search, SearchX, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { TxnDrawer, TxnRow } from "@/components/banking/txn";
import { StatementExportModal } from "@/components/banking/transparency";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Menu } from "@/components/ui/menu";
import { EmptyState, Money } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { categoryMeta } from "@/lib/data/merchants";
import { person } from "@/lib/data/personal";
import { cn } from "@/lib/cn";
import { dayLabel, groupBy, iban as fmtIban, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Category, Txn } from "@/lib/types";

type Flow = "all" | "in" | "out" | "pending";

function matches(t: Txn, q: string) {
  if (!q) return true;
  const needle = q.trim().toLowerCase().replace(",", ".");
  const amount = Math.abs(t.amount).toFixed(2);
  return (
    t.counterparty.toLowerCase().includes(needle) ||
    (t.reference ?? "").toLowerCase().includes(needle) ||
    categoryMeta[t.category].label.toLowerCase().includes(needle) ||
    amount.includes(needle.replace("€", "").replace("-", "").replace("−", ""))
  );
}

export function Transactions() {
  const { state } = useStore();
  const toast = useToast();
  const { txns, cards, accounts } = state.personal;
  const main = accounts.find((a) => a.id === "p-main")!;

  const [query, setQuery] = useState("");
  const [flow, setFlow] = useState<Flow>("all");
  const [category, setCategory] = useState<Category | null>(null);
  const [openTxn, setOpenTxn] = useState<Txn | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  // A refunded purchase and its refund cancel out, so neither counts towards the month.
  const counted = txns.filter((t) => t.status !== "declined" && t.status !== "refunded" && !t.refundOf);
  const moneyIn = counted.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const moneyOut = counted.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const pendingCount = txns.filter((t) => t.status === "pending").length;
  const declinedCount = txns.filter((t) => t.status === "declined").length;
  const refundedCount = txns.filter((t) => t.status === "refunded").length;
  const inCount = counted.filter((t) => t.amount > 0).length;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const usedCategories = useMemo(() => {
    const seen = new Map<Category, number>();
    for (const t of txns) seen.set(t.category, (seen.get(t.category) ?? 0) + 1);
    return [...seen.entries()].sort((a, b) => b[1] - a[1]);
  }, [txns]);

  const filtered = txns.filter((t) => {
    if (flow === "in" && t.amount <= 0) return false;
    if (flow === "out" && t.amount >= 0) return false;
    if (flow === "pending" && t.status !== "pending") return false;
    if (category && t.category !== category) return false;
    return matches(t, query);
  });
  const days = groupBy(filtered, (t) => dayLabel(t.at));
  const filtersOn = !!query || flow !== "all" || !!category;

  const clear = () => {
    setQuery("");
    setFlow("all");
    setCategory(null);
  };

  return (
    <PageContainer>
      <Suspense fallback={null}>
        <QueryParam onQuery={setQuery} />
      </Suspense>
      <PageHeader
        title="Transactions"
        description={
          <>
            {main.name} · <span className="font-mono text-[14px] tracking-tight">{fmtIban(main.iban)}</span>
          </>
        }
        actions={
          <Button variant="secondary" leading={<Download className="size-4" />} onClick={() => setExportOpen(true)}>
            Download statement
          </Button>
        }
      />

      {/* Month summary — one strip, directly labelled */}
      <Card className="mb-5 grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat label="Money in · October" value={<Money value={moneyIn} sign className="text-success" />} note={plural(inCount, "payment") + " received"} />
        <Stat
          label="Money out · October"
          value={<Money value={moneyOut} />}
          note={`Excludes ${plural(declinedCount, "declined payment")} and ${refundedCount} refunded purchase (−€89.00, refunded +€89.00)`}
        />
        <Stat
          label="Net this month"
          value={<Money value={moneyIn + moneyOut} sign className={moneyIn + moneyOut >= 0 ? "text-ink" : "text-danger"} />}
          note={`Includes ${plural(pendingCount, "pending card payment")}`}
        />
      </Card>

      {/* Toolbar */}
      <div className="mb-3 flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search merchant, amount or reference — e.g. Rimi, 48.37"
          prefix={<Search className="size-4" />}
          suffix={
            query ? (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="text-ink-4 hover:text-ink">
                <X className="size-4" />
              </button>
            ) : undefined
          }
          wrapperClassName="lg:max-w-[380px] lg:flex-1"
          aria-label="Search transactions"
        />
        <div className="scrollbar-none -mx-4 flex items-center gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <Segmented<Flow>
            value={flow}
            onChange={setFlow}
            items={[
              { value: "all", label: "All" },
              { value: "in", label: "Money in" },
              { value: "out", label: "Money out" },
              { value: "pending", label: "Pending", count: pendingCount },
            ]}
          />
          <Menu
            align="end"
            trigger={({ toggle, open }) => (
              <Button
                variant="secondary"
                size="md"
                pill
                onClick={toggle}
                className={cn(open && "bg-subtle")}
                leading={category ? <span className="size-2 rounded-full" style={{ background: categoryMeta[category].color }} /> : undefined}
                trailing={<ChevronDown className="size-3.5 text-ink-3" />}
              >
                {category ? categoryMeta[category].label : "All categories"}
              </Button>
            )}
            items={[
              {
                label: "All categories",
                hint: !category ? <Check className="size-4 text-ink" /> : undefined,
                onSelect: () => setCategory(null),
              },
              "separator",
              ...usedCategories.map(([cat, count]) => ({
                label: categoryMeta[cat].label,
                icon: <span className="block size-2 rounded-full" style={{ background: categoryMeta[cat].color }} />,
                hint: category === cat ? <Check className="size-4 text-ink" /> : <span className="tabular">{count}</span>,
                onSelect: () => setCategory(cat),
              })),
            ]}
          />
        </div>
        {filtersOn && (
          <button onClick={clear} className="text-[13px] font-medium text-ink-3 hover:text-ink lg:ml-auto">
            Clear filters
          </button>
        )}
      </div>

      <p className="mb-2 px-1 text-[12px] text-ink-3">
        Showing <span className="tabular">{filtered.length}</span> of <span className="tabular">{txns.length}</span> transactions · times in Tallinn time
      </p>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title={query ? `No transactions match “${query}”` : "No transactions match these filters"}
            description="Try a merchant name, an amount like 48.37, or a word from the payment description."
            action={
              <Button variant="secondary" size="sm" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="px-2 pt-1 pb-3">
            {days.map(([day, list]) => {
              const total = list.filter((t) => t.status !== "declined").reduce((s, t) => s + t.amount, 0);
              return (
                <div key={day}>
                  <div className="sticky top-14 z-[1] flex items-center justify-between bg-surface/95 px-3 pt-3 pb-1 backdrop-blur">
                    <p className="text-[12px] font-medium text-ink-3">{day}</p>
                    <p className="tabular text-[12px] text-ink-4">{money(total, { sign: true })}</p>
                  </div>
                  {list.map((t) => (
                    <TxnRow key={t.id} txn={t} onClick={() => setOpenTxn(t)} />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <TxnDrawer txn={openTxn} onClose={() => setOpenTxn(null)} cards={cards} />
      <StatementExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        accounts={accounts.filter((a) => a.kind === "current" || a.kind === "savings")}
        txns={state.personal.txns}
        holder={{ name: person.name, id: person.idCode }}
        onExport={({ file, account, period }) => toast({ title: "Statement downloaded", description: `${file} · ${account} · ${period}` })}
      />
    </PageContainer>
  );
}

function Stat({ label, value, note }: { label: string; value: React.ReactNode; note: string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-[13px] text-ink-3">{label}</p>
      <p className="font-display mt-1 text-[22px] font-semibold tracking-[-0.015em]">{value}</p>
      <p className="mt-0.5 text-[12px] text-ink-4">{note}</p>
    </div>
  );
}

/** `?q=` from the command menu pre-fills the search, then clears itself from the URL. */
function QueryParam({ onQuery }: { onQuery: (q: string) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q");
  useEffect(() => {
    if (!q) return;
    onQuery(q);
    router.replace("/personal/transactions", { scroll: false });
  }, [q, onQuery, router]);
  return null;
}
