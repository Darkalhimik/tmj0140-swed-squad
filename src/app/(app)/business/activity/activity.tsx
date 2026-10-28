"use client";

import { Calendar, ChevronDown, ChevronRight, Download, History, Search, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { categoryOf, parseDiff, requestId, toCsvRow, verb, type ActivityCategory } from "@/components/business/activity-utils";
import { OakMark } from "@/components/brand/logo";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu } from "@/components/ui/menu";
import { EmptyState, KeyValue, Tooltip } from "@/components/ui/misc";
import { Drawer } from "@/components/ui/overlay";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { company, members as seedMembers, roleMeta } from "@/lib/data/business";
import { dayLabel, fmtDateTime, fmtTime, groupBy, NOW, relative } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { AuditEvent } from "@/lib/types";

type Category = "all" | ActivityCategory;
type Period = "1" | "7" | "30" | "all";

const NOW_ISO = NOW.toISOString();
const periodLabels: Record<Period, string> = { "1": "Last 24 hours", "7": "Last 7 days", "30": "Last 30 days", all: "All time" };

export function ActivityLog() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [period, setPeriod] = useState<Period>("30");
  const [actorOverride, setActorOverride] = useState<string | null>(null);
  const [open, setOpen] = useState<AuditEvent | null>(null);
  const actor = actorOverride ?? params.get("actor") ?? "all";

  const people = useMemo(() => {
    const map = new Map(seedMembers.map((m) => [m.id, m]));
    for (const m of state.business.members) map.set(m.id, m);
    return map;
  }, [state.business.members]);
  const nameOf = (id: string) => (id === "system" ? "Swedbank" : (people.get(id)?.name ?? id));

  const events = state.business.audit.filter((e) => {
    if (actor !== "all" && e.actor !== actor) return false;
    if (category !== "all" && categoryOf(e.action) !== category) return false;
    if (period !== "all" && NOW.getTime() - new Date(e.at).getTime() > Number(period) * 86_400_000) return false;
    if (query) {
      const hay = `${nameOf(e.actor)} ${verb(e.action)} ${e.action} ${e.target} ${e.detail ?? ""} ${e.ip}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
    }
    return true;
  });
  const days = groupBy(events, (e) => dayLabel(e.at));
  const filtered = actor !== "all" || category !== "all" || period !== "30" || !!query;

  const exportCsv = () => {
    const header = "time,actor,action,target,detail,device,ip";
    const csv = [header, ...events.map((e) => toCsvRow(e, nameOf(e.actor)))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity-log-2026-10-29.csv";
    a.click();
    URL.revokeObjectURL(url);
    dispatch({
      type: "biz/log",
      action: "export.created",
      target: "Activity log",
      detail: `CSV · ${periodLabels[period].toLowerCase()} · ${events.length} rows`,
    });
    toast({ title: "Export ready", description: "activity-log-2026-10-29.csv · the export itself is now in the log" });
  };

  const actorItems = [
    { id: "all", label: "Everyone" },
    ...[...people.values()].map((m) => ({ id: m.id, label: m.name })),
    { id: "system", label: "Swedbank (automatic)" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Activity log"
        description={`Every sign-in, payment, card and access change at ${company.name}. Entries are kept for 7 years and can't be edited or deleted — not even by owners.`}
        actions={
          <Button variant="secondary" leading={<Download className="size-4" />} onClick={exportCsv} disabled={!events.length}>
            Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <Input
          size="sm"
          wrapperClassName="lg:w-72"
          prefix={<Search className="size-3.5" />}
          placeholder="Search people, payments, IPs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search activity"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Menu
            align="start"
            trigger={({ toggle }) => (
              <Button size="sm" variant="secondary" onClick={toggle} leading={<Users className="size-3.5" />} trailing={<ChevronDown className="size-3.5 text-ink-3" />}>
                {actor === "all" ? "Everyone" : nameOf(actor)}
              </Button>
            )}
            items={actorItems.map((a) => ({
              label: a.label,
              icon: a.id === "all" ? <Users className="size-4" /> : a.id === "system" ? <OakMark className="size-4" /> : <Avatar name={a.label} size="xs" />,
              hint: a.id === actor ? "✓" : undefined,
              onSelect: () => setActorOverride(a.id),
            }))}
          />
          <Menu
            align="start"
            trigger={({ toggle }) => (
              <Button size="sm" variant="secondary" onClick={toggle} leading={<Calendar className="size-3.5" />} trailing={<ChevronDown className="size-3.5 text-ink-3" />}>
                {periodLabels[period]}
              </Button>
            )}
            items={(Object.keys(periodLabels) as Period[]).map((p) => ({
              label: periodLabels[p],
              hint: p === period ? "✓" : undefined,
              onSelect: () => setPeriod(p),
            }))}
          />
        </div>
        <Segmented<Category>
          className="scrollbar-none max-w-full overflow-x-auto lg:ml-auto"
          size="sm"
          value={category}
          onChange={setCategory}
          items={[
            { value: "all", label: "All" },
            { value: "payments", label: "Payments" },
            { value: "access", label: "Access" },
            { value: "cards", label: "Cards" },
            { value: "security", label: "Security" },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-surface shadow-card">
        <div className="hidden grid-cols-[88px_minmax(0,1.3fr)_minmax(0,3fr)_minmax(0,1.4fr)_20px] gap-4 border-b border-line bg-canvas px-5 py-2.5 text-[12px] font-medium text-ink-3 md:grid">
          <span>Time</span>
          <span>Who</span>
          <span>What happened</span>
          <span>Device · IP</span>
          <span />
        </div>
        {events.length === 0 ? (
          <EmptyState
            icon={<History className="size-5" />}
            title="No activity matches these filters"
            description="Try a longer period or clear the search."
            action={
              filtered ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                    setPeriod("all");
                    setActorOverride("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          days.map(([day, list]) => (
            <section key={day}>
              <p className="border-b border-line bg-subtle/50 px-5 py-1.5 text-[12px] font-medium text-ink-3">{day}</p>
              <ul className="divide-y divide-line">
                {list.map((e) => (
                  <Row key={e.id} event={e} actorName={nameOf(e.actor)} onOpen={() => setOpen(e)} />
                ))}
              </ul>
            </section>
          ))
        )}
        <div className="flex flex-col gap-1 border-t border-line bg-canvas px-5 py-3 text-[12px] text-ink-3 sm:flex-row sm:justify-between">
          <span>
            {events.length} event{events.length === 1 ? "" : "s"} · {periodLabels[period].toLowerCase()}
          </span>
          <span>Times in Tallinn (EET) · exports are logged too</span>
        </div>
      </div>

      <EventDrawer event={open} onClose={() => setOpen(null)} actorName={open ? nameOf(open.actor) : ""} role={open ? people.get(open.actor)?.role : undefined} />
    </PageContainer>
  );
}

function ActorAvatar({ id, name }: { id: string; name: string }) {
  if (id === "system")
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cream">
        <OakMark className="size-4" />
      </span>
    );
  return <Avatar name={name} size="sm" />;
}

function Row({ event: e, actorName, onOpen }: { event: AuditEvent; actorName: string; onOpen: () => void }) {
  const fresh = e.at === NOW_ISO;
  return (
    <li>
      <button
        onClick={onOpen}
        className={cn(
          "group relative grid w-full grid-cols-[minmax(0,1fr)_16px] gap-x-3 gap-y-1 px-5 py-3 text-left transition-colors hover:bg-subtle md:grid-cols-[88px_minmax(0,1.3fr)_minmax(0,3fr)_minmax(0,1.4fr)_20px] md:items-center md:gap-4",
          fresh && "bg-brand-soft/50",
        )}
      >
        {fresh && <span className="absolute inset-y-0 left-0 w-0.5 bg-brand" />}
        <span className="hidden md:block">
          <Tooltip content={fmtDateTime(e.at)}>
            <span className={cn("tabular text-[13px]", fresh ? "font-medium text-brand-text" : "text-ink-3")}>{fresh ? "just now" : fmtTime(e.at)}</span>
          </Tooltip>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <ActorAvatar id={e.actor} name={actorName} />
          <span className="truncate text-[13px] font-medium text-ink">{actorName}</span>
          <span className="tabular ml-auto shrink-0 text-[12px] text-ink-4 md:hidden">{fresh ? "just now" : fmtTime(e.at)}</span>
        </span>
        <span className="col-start-1 min-w-0 pl-8 md:col-start-auto md:pl-0">
          <span className="block truncate text-[13px] text-ink-2">
            {verb(e.action)} <span className="font-medium text-ink">{e.target}</span>
          </span>
          {e.detail && <span className="block truncate text-[12px] text-ink-3">{e.detail}</span>}
        </span>
        <span className="hidden min-w-0 md:block">
          <span className="block truncate text-[12px] text-ink-3">{e.device}</span>
          <span className="block truncate font-mono text-[11px] tracking-tight text-ink-4">{e.ip}</span>
        </span>
        <ChevronRight className="col-start-2 row-span-2 row-start-1 size-4 self-center text-ink-4 transition-transform group-hover:translate-x-0.5 md:col-start-auto md:row-span-1 md:row-start-auto" />
      </button>
    </li>
  );
}

function EventDrawer({
  event: e,
  onClose,
  actorName,
  role,
}: {
  event: AuditEvent | null;
  onClose: () => void;
  actorName: string;
  role?: keyof typeof roleMeta;
}) {
  const diff = parseDiff(e?.detail);
  return (
    <Drawer open={!!e} onClose={onClose} title="Event details" description={e ? `${actorName} ${verb(e.action)} ${e.target}` : undefined}>
      {e && (
        <div className="flex flex-col">
          <section className="border-b border-line px-5 py-3">
            <dl className="divide-y divide-line">
              <KeyValue label="When">
                {fmtDateTime(e.at)} <span className="text-ink-3">· {e.at === NOW_ISO ? "just now" : relative(e.at)}</span>
              </KeyValue>
              <KeyValue label="Who">
                <span className="inline-flex items-center gap-1.5">
                  <ActorAvatar id={e.actor} name={actorName} />
                  {actorName}
                  {role && <span className="text-ink-3">· {roleMeta[role].label}</span>}
                  {e.actor === "system" && <span className="text-ink-3">· automatic</span>}
                </span>
              </KeyValue>
              <KeyValue label="Action" mono>
                {e.action}
              </KeyValue>
              <KeyValue label="Target">{e.target}</KeyValue>
              {e.detail && !diff && <KeyValue label="Detail">{e.detail}</KeyValue>}
              <KeyValue label="Device">{e.device}</KeyValue>
              <KeyValue label="IP address" mono>
                {e.ip}
              </KeyValue>
              <KeyValue label="Request ID" mono>
                {requestId(e)}
              </KeyValue>
            </dl>
          </section>

          {diff && (
            <section className="border-b border-line px-5 py-4">
              <p className="mb-2 text-[13px] font-medium text-ink">{diff.label ? `${diff.label} changed` : "Change"}</p>
              <div className="overflow-hidden rounded-lg font-mono text-[12px] shadow-[inset_0_0_0_1px_var(--color-line)]">
                <p className="bg-danger-soft px-3 py-1.5 text-danger">− {diff.before}</p>
                <p className="bg-success-soft px-3 py-1.5 text-success">+ {diff.after}</p>
              </div>
            </section>
          )}

          <section className="flex flex-col gap-2 px-5 py-4 text-[12px] text-ink-3">
            <p className="flex items-center gap-1.5">
              <Badge size="xs" tone="gray" className="capitalize">
                {categoryOf(e.action)}
              </Badge>
              Recorded by Swedbank, read-only, retained until {new Date(e.at).getUTCFullYear() + 7}.
            </p>
            <p>Something you don&apos;t recognise? Freeze cards and sign out all devices from Company → Limits & security, then call 613 2222.</p>
          </section>
        </div>
      )}
    </Drawer>
  );
}
