"use client";

import { ChevronRight, Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { BankCard } from "@/components/banking/bank-card";
import { CardDrawer, cardOwnerName, IssueCardModal } from "@/components/business/cards-drawer";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { EmptyState, Money, Note } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

type Filter = "all" | "active" | "frozen" | "virtual";

export function BusinessCards() {
  const { state } = useStore();
  const toast = useToast();
  const { cards, members, txns } = state.business;
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);

  const shown = cards.filter((c) =>
    filter === "all" ? true : filter === "active" ? !c.frozen : filter === "frozen" ? c.frozen : c.kind === "virtual",
  );
  const spent = cards.reduce((s, c) => s + (c.limits[0]?.used ?? 0), 0);
  const missing = txns.filter((t) => t.receipt === false);

  return (
    <PageContainer>
      <PageHeader
        title="Cards"
        description={`${cards.length} cards · ${money(spent)} spent this month · €2.00 per card per month`}
        actions={
          <Button variant="primary" leading={<Plus className="size-4" />} onClick={() => setIssuing(true)}>
            Issue card
          </Button>
        }
      />

      {missing.length > 0 && (
        <Note
          tone="warning"
          className="mb-5"
          title={`${missing.length} card payments are missing receipts`}
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast({ title: "Reminders sent", description: `${missing.length} people can snap the receipt in the app` })}
            >
              Remind
            </Button>
          }
        >
          {missing
            .map((t) => `${members.find((m) => m.id === t.memberId)?.name ?? "—"} · ${t.counterparty} ${money(Math.abs(t.amount))}`)
            .join(" · ")}
        </Note>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          size="sm"
          items={[
            { value: "all", label: "All", count: cards.length },
            { value: "active", label: "Active", count: cards.filter((c) => !c.frozen).length },
            { value: "frozen", label: "Frozen", count: cards.filter((c) => c.frozen).length },
            { value: "virtual", label: "Virtual", count: cards.filter((c) => c.kind === "virtual").length },
          ]}
        />
      </div>

      <Card className="overflow-hidden">
        {shown.length === 0 ? (
          <EmptyState title="No cards match this filter" description="Try another filter or issue a new card." />
        ) : (
          <ul>
            {shown.map((c) => {
              const owner = cardOwnerName(c, members);
              const member = members.find((m) => m.id === c.memberId);
              const l = c.limits[0]!;
              const missingForCard = txns.filter((t) => t.cardId === c.id && t.receipt === false).length;
              return (
                <li key={c.id} className="border-b border-line last:border-0">
                  <button
                    onClick={() => setOpenId(c.id)}
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-subtle sm:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,1fr)_auto_auto]"
                  >
                    <BankCard card={c} size="sm" className="w-[88px]! rounded-md!" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-ink">
                        {member && <Avatar name={member.name} size="xs" />}
                        {owner}
                      </p>
                      <p className="truncate text-[12px] text-ink-3">
                        {c.name} <span className="font-mono">••{c.last4}</span>
                        {member ? ` · ${member.title}` : " · Figma, Google, AWS"}
                      </p>
                      {missingForCard > 0 && (
                        <p className="mt-0.5 flex items-center gap-1 text-[12px] text-warning">
                          <Receipt className="size-3" />
                          {missingForCard} receipt missing
                        </p>
                      )}
                    </div>
                    <div className="col-span-3 row-start-2 min-w-0 sm:col-span-1 sm:row-start-auto">
                      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[12px]">
                        <span className="tabular text-ink-2">
                          <Money value={l.used} /> <span className="text-ink-4">of {money(l.max)}</span>
                        </span>
                        <span className="text-ink-4">{money(Math.max(0, l.max - l.used))} left · resets 1 Nov</span>
                      </div>
                      <Meter value={l.used} max={l.max} />
                    </div>
                    <span className="hidden sm:block">
                      {c.frozen ? <Badge tone="info">Frozen</Badge> : <Badge tone="success">Active</Badge>}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="sm:hidden">{c.frozen && <Badge tone="info">Frozen</Badge>}</span>
                      <ChevronRight className={cn("size-4 text-ink-4")} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <CardDrawer cardId={openId} onClose={() => setOpenId(null)} />
      <IssueCardModal open={issuing} onClose={() => setIssuing(false)} />
    </PageContainer>
  );
}
