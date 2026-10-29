import { Building2, Check, ExternalLink, FileText, Hourglass, Landmark, Monitor, Phone, TriangleAlert, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { cn } from "@/lib/cn";
import { LivePreview } from "./live-preview";
import { ASSUMPTIONS, CHANNEL_LABEL, SCOREBOARD, scenarios, SOURCES, type Channel } from "./scenarios";

export const metadata: Metadata = {
  title: "Swedbank today vs. the concept",
  description: "Five everyday banking jobs, step by step: how they work at Swedbank Estonia today and in the SWED SQUAD concept.",
};

const CHANNEL_ICON: Record<Channel, LucideIcon> = {
  site: Monitor,
  state: Landmark,
  phone: Phone,
  branch: Building2,
  wait: Hourglass,
  pdf: FileText,
};

const OFFLINE: Channel[] = ["phone", "branch", "wait"];

export default function ComparePage() {
  return (
    <main className="mx-auto max-w-[1180px] px-4 pt-10 pb-20 lg:px-8">
      <section className="max-w-3xl">
        <h1 className="text-[34px] leading-[40px] font-semibold tracking-[-0.015em]">Swedbank today vs. the concept</h1>
        <p className="mt-3 text-[17px] leading-7 text-ink-2">
          Five everyday jobs, step by step. On the left, how they work at Swedbank Estonia today. On the right, the same job in our prototype — live,
          so you can click through it.
        </p>
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-[13px] leading-5 text-ink-3 shadow-card">
          <span className="font-medium text-ink-2">How we built the “today” column.</span> From swedbank.ee pages, Swedbank’s price lists, the RIK
          guide and public app reviews, checked on 29 October 2026. We had no access to the logged-in internet bank, so “today” is a list of steps
          with sources — not screenshots. Anything we couldn’t confirm is marked.
        </p>
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Scenarios">
          {scenarios.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="h-8 rounded-full bg-surface px-3.5 text-[13px] leading-8 text-ink-2 shadow-card hover:text-ink">
              {i + 1}. {s.title}
            </a>
          ))}
        </nav>
      </section>

      <section className="mt-10 overflow-hidden rounded-xl bg-surface shadow-card" aria-labelledby="glance">
        <h2 id="glance" className="border-b border-line px-5 py-3.5 text-[15px] font-semibold">
          At a glance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-canvas text-[12px] text-ink-3">
              <tr>
                <th className="px-5 py-2.5 font-medium">What it takes</th>
                <th className="px-5 py-2.5 font-medium">Swedbank today</th>
                <th className="px-5 py-2.5 font-medium">Concept</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {SCOREBOARD.map((r) => (
                <tr key={r.label}>
                  <td className="px-5 py-3 text-ink-2">{r.label}</td>
                  <td className="px-5 py-3 text-ink">{r.today}</td>
                  <td className="px-5 py-3 font-medium text-ink">{r.concept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {scenarios.map((s, i) => {
        const offline = s.today.steps.filter((st) => OFFLINE.includes(st.channel)).length;
        return (
          <section key={s.id} id={s.id} className="mt-16 scroll-mt-20">
            <p className="text-[13px] font-medium text-brand-text">Job {i + 1}</p>
            <h2 className="mt-1 text-[26px] leading-8 font-semibold tracking-[-0.015em]">{s.title}</h2>
            <p className="mt-1 text-[15px] text-ink-3">{s.job}</p>

            <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
              {/* Today */}
              <div className="rounded-xl bg-subtle p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-semibold">Swedbank today</h3>
                  <p className="text-[12px] text-ink-3">
                    {s.today.steps.length} steps{offline ? ` · ${offline} outside the internet bank` : ""}
                  </p>
                </div>
                <ol className="mt-4 flex flex-col gap-3">
                  {s.today.steps.map((st, n) => {
                    const Icon = CHANNEL_ICON[st.channel];
                    const out = OFFLINE.includes(st.channel);
                    return (
                      <li key={n} className="flex gap-3">
                        <span className="tabular mt-0.5 w-5 shrink-0 text-right text-[13px] text-ink-4">{n + 1}</span>
                        <div className="min-w-0">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                              out ? "bg-warning-soft text-warning" : "bg-surface text-ink-3 shadow-[inset_0_0_0_1px_var(--color-line)]",
                            )}
                          >
                            <Icon className="size-3" />
                            {CHANNEL_LABEL[st.channel]}
                          </span>
                          <p className="mt-1 text-sm text-ink">{st.text}</p>
                          {st.note && <p className="mt-0.5 text-[13px] text-ink-3">{st.note}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {s.today.unverified && (
                  <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2.5 text-[13px] text-warning">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                    <span>
                      <span className="font-medium">To verify:</span> {s.today.unverified}
                    </span>
                  </p>
                )}
                <ul className="mt-4 flex flex-col gap-1 border-t border-line pt-3">
                  {s.today.sources.map((src) => (
                    <li key={src.url}>
                      <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-teal hover:underline">
                        {src.label}
                        <ExternalLink className="size-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concept */}
              <div className="flex flex-col gap-4">
                <LivePreview route={s.concept.route} label={s.concept.routeLabel} />
                <div className="rounded-xl bg-surface p-5 shadow-card">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[15px] font-semibold">In the concept</h3>
                    <p className="text-[12px] text-ink-3">All in the internet bank</p>
                  </div>
                  <ol className="mt-3 flex flex-col gap-2">
                    {s.concept.steps.map((st) => (
                      <li key={st} className="flex gap-2.5 text-sm text-ink">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        {st}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl bg-surface shadow-card">
              <div className="grid grid-cols-2 border-b border-line bg-canvas text-[12px] font-medium text-ink-3">
                <p className="px-5 py-2.5">Problem today</p>
                <p className="px-5 py-2.5">What the concept does</p>
              </div>
              <ul className="divide-y divide-line">
                {s.changes.map((c) => (
                  <li key={c.problem} className="grid grid-cols-2 text-sm">
                    <p className="px-5 py-3 text-ink-2">{c.problem}</p>
                    <p className="px-5 py-3 text-ink">{c.fix}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="mt-16 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-card">
          <h2 className="text-[15px] font-semibold">What the concept assumes</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-2">
            {ASSUMPTIONS.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-4" />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-card">
          <h2 className="text-[15px] font-semibold">Sources</h2>
          <ul className="mt-3 flex flex-col gap-1.5">
            {SOURCES.map((src) => (
              <li key={src.url}>
                <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-teal hover:underline">
                  {src.label}
                  <ExternalLink className="size-3" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-ink-3">Full research notes, with every quote and figure: docs/research in the repository.</p>
        </div>
      </section>
    </main>
  );
}
