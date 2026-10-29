"use client";

import { ArrowUpRight, Plus, RefreshCw, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { CopyRow } from "@/components/banking/account-modals";
import { SmartIdModal } from "@/components/banking/smart-id";
import { IntegrationsSection } from "@/components/business/settings-integrations";
import { AccountStatusSection, KycSection } from "@/components/business/settings-kyc";
import { LimitsSection, LoginSection } from "@/components/business/settings-limits";
import { ReadOnlyField, SettingsSection } from "@/components/business/settings-shared";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { CompanyMark } from "@/components/shell/sidebar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StackBar } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Money, Note } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { roleMeta } from "@/lib/data/business";
import { fmtDate, iban as fmtIban, money } from "@/lib/format";
import { useCompany, useStore } from "@/lib/store";

const SECTIONS = [
  { id: "general", label: "General" },
  { id: "people", label: "People & ownership" },
  { id: "kyc", label: "Know your customer" },
  { id: "status", label: "Account status" },
  { id: "accounts", label: "Accounts" },
  { id: "limits", label: "Payment limits" },
  { id: "security", label: "Login restrictions" },
  { id: "integrations", label: "Integrations" },
  { id: "danger", label: "Close account" },
];

const OWNER_COLORS = ["var(--color-brown)", "var(--color-turquoise)", "var(--color-brand)", "var(--color-yellow)"];

export function CompanySettings() {
  return (
    <PageContainer>
      <PageHeader
        title="Company"
        description="Your company as the bank sees it — registry data, people, limits and everything we hold about you."
      />
      <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-20 flex flex-col gap-0.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-md px-2.5 py-1.5 text-[13px] text-ink-3 transition-colors hover:bg-subtle hover:text-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex min-w-0 flex-col gap-5">
          <GeneralSection />
          <PeopleSection />
          <KycSection />
          <AccountStatusSection />
          <AccountsSection />
          <LimitsSection />
          <LoginSection />
          <IntegrationsSection />
          <DangerSection />
        </div>
      </div>
    </PageContainer>
  );
}

function GeneralSection() {
  const company = useCompany();
  return (
    <SettingsSection
      id="general"
      title="Company profile"
      description="Synced from the e-Business Register, so there's nothing to keep up to date twice."
      aside={
        <Badge tone="gray" icon={<RefreshCw className="size-3" />}>
          From e-Business Register · synced 2 h ago
        </Badge>
      }
      footer={
        <>
          <span>Changes are made in the e-Business Register — they show up here after the register publishes them.</span>
          <a
            href="https://ariregister.rik.ee"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-teal hover:underline"
          >
            Open e-Business Register <ArrowUpRight className="size-3.5" />
          </a>
        </>
      }
    >
      <div className="mb-5 flex items-center gap-3">
        <CompanyMark size="lg" />
        <div>
          <p className="text-[17px] font-semibold tracking-[-0.02em]">{company.name}</p>
          <p className="text-[13px] text-ink-3">Private limited company (osaühing) · founded {fmtDate(company.founded, "long")}</p>
        </div>
      </div>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReadOnlyField label="Registry code" value={company.registryCode} mono />
        <ReadOnlyField
          label="VAT number"
          value={company.vat && company.vat.startsWith("EE") ? company.vat : company.vat === "Requested" ? "Requested from EMTA" : "Not registered (under €40,000 a year)"}
          mono={!!company.vat?.startsWith("EE")}
        />
        <ReadOnlyField label="Registered address" value={company.address} />
        <ReadOnlyField label="Main activity (EMTAK)" value={company.emtak} />
        <ReadOnlyField label="Financial year" value="1 Jan – 31 Dec" />
        <ReadOnlyField label="Employees (employment register)" value={company.employees} />
      </div>
    </SettingsSection>
  );
}

function PeopleSection() {
  const company = useCompany();
  const OWNERS = company.owners.map((o, i) => ({ ...o, color: OWNER_COLORS[i % OWNER_COLORS.length]! }));
  const { state } = useStore();
  // The registry decides who is on the board; bank access is a separate, per-person grant.
  const board = company.board.map((name) => ({
    name,
    member: state.business.members.find((m) => m.name === name),
    invite: state.business.invites.find((i) => i.email.split("@")[0]!.replace(/\./g, " ").toLowerCase().startsWith(name.split(" ")[0]!.toLowerCase())),
  }));

  return (
    <SettingsSection
      id="people"
      title="People & ownership"
      description="Management board and owners as registered. Bank access is managed separately in Team & access."
    >
      <p className="mb-2 text-[13px] font-medium text-ink-2">Management board</p>
      <ul className="divide-y divide-line rounded-lg shadow-[0_0_0_1px_var(--color-line)]">
        {board.map(({ name, member, invite }) => (
          <li key={name} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={name} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{name}</p>
                <p className="text-[12px] text-ink-3">
                  Board member · {company.representation === "joint" ? "represents the company jointly" : "represents the company alone"}
                </p>
              </div>
            </div>
            <p className="pl-11 text-[12px] text-ink-3 sm:pl-0 sm:text-right">
              {member ? (
                <>
                  Bank access: <span className="font-medium text-ink-2">{roleMeta[member.role].label}</span> · {roleMeta[member.role].rights}
                </>
              ) : invite ? (
                <>
                  Bank access: <span className="font-medium text-warning">invited as {roleMeta[invite.role].label}</span> · not accepted yet
                </>
              ) : (
                "No bank access"
              )}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <p className="text-[13px] font-medium text-ink-2">Shareholders & beneficial owners</p>
        <p className="text-[12px] text-ink-4">Declared {fmtDate(company.founded, "long")}</p>
      </div>
      <StackBar className="mt-3 h-2.5" parts={OWNERS.map((o) => ({ label: o.name, value: o.share, color: o.color }))} />
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {OWNERS.map((o) => (
          <li key={o.name} className="flex items-center gap-3 rounded-lg bg-subtle px-3.5 py-2.5">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: o.color }} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink">{o.name}</span>
              <span className="block text-[12px] text-ink-3">Beneficial owner · direct ownership</span>
            </span>
            <span className="tabular text-sm font-semibold">{o.share}%</span>
          </li>
        ))}
      </ul>
    </SettingsSection>
  );
}

type Purpose = "tax" | "savings" | "project";

function AccountsSection() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [extra, setExtra] = useState<{ name: string; iban: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [signing, setSigning] = useState<{ name: string; iban: string } | null>(null);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("project");
  const nextIban = `EE${81 + extra.length}2200221077885${545 + extra.length * 8}`;

  return (
    <SettingsSection
      id="accounts"
      title="Accounts"
      description="Every account has its own IBAN. Sub-accounts are free and open instantly."
      aside={
        <Button size="sm" variant="secondary" leading={<Plus className="size-3.5" />} onClick={() => setOpen(true)}>
          Open sub-account
        </Button>
      }
      footer={<span>BIC/SWIFT for all accounts: HABAEE2X · Swedbank AS, Liivalaia 34, 15040 Tallinn</span>}
    >
      <ul className="divide-y divide-line">
        {state.business.accounts.map((a) => (
          <li key={a.id} className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <CopyRow label={a.name} value={fmtIban(a.iban)} />
            </div>
            <Money value={a.balance} className="text-sm font-medium" />
          </li>
        ))}
        {extra.map((a) => (
          <li key={a.iban} className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <CopyRow label={`${a.name} · new`} value={fmtIban(a.iban)} />
            </div>
            <Money value={0} className="text-sm font-medium text-ink-3" />
          </li>
        ))}
      </ul>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Open a sub-account"
        description="Free, ready instantly, with its own IBAN. Everyone with access to the company sees it."
        footer={
          <>
            <Button variant="tertiary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!name.trim()}
              onClick={() => {
                setOpen(false);
                setSigning({ name: name.trim(), iban: nextIban });
              }}
            >
              Review & sign
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Segmented<Purpose>
            value={purpose}
            onChange={(p) => {
              setPurpose(p);
              if (!name || ["VAT reserve", "Rainy day fund", "Client project"].includes(name))
                setName(p === "tax" ? "VAT reserve" : p === "savings" ? "Rainy day fund" : "Client project");
            }}
            size="sm"
            items={[
              { value: "project", label: "Project" },
              { value: "tax", label: "Tax reserve" },
              { value: "savings", label: "Savings" },
            ]}
          />
          <Input label="Account name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client project" autoFocus />
          <Note tone="gray">No monthly fee. Payments from a sub-account count towards the same 1,000 free euro payments.</Note>
        </div>
      </Modal>

      <SmartIdModal
        open={!!signing}
        onClose={() => setSigning(null)}
        action={`Open sub-account “${signing?.name ?? ""}”`}
        details={[
          { label: "IBAN", value: signing ? fmtIban(signing.iban) : "" },
          { label: "Monthly fee", value: money(0) },
        ]}
        onConfirmed={() => {
          if (!signing) return;
          setExtra((e) => [...e, signing]);
          dispatch({ type: "biz/log", action: "account.opened", target: signing.name, detail: `IBAN ${fmtIban(signing.iban)}` });
          toast({ title: "Sub-account opened", description: `${signing.name} · ${fmtIban(signing.iban)}` });
          setSigning(null);
          setName("");
        }}
      />
    </SettingsSection>
  );
}

function DangerSection() {
  const company = useCompany();
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const balance = state.business.accounts.reduce((s, a) => s + a.balance, 0);
  const cards = state.business.cards.filter((c) => !c.frozen).length;
  const scheduled = state.business.payments.filter((p) => p.status === "scheduled" || p.status === "awaiting").length;
  const blockers = [
    balance > 0 && `Move the remaining ${money(balance)} to another account`,
    cards > 0 && `Cancel ${cards} active card${cards === 1 ? "" : "s"}`,
    scheduled > 0 && `Cancel or complete ${scheduled} scheduled or pending payment${scheduled === 1 ? "" : "s"}`,
  ].filter(Boolean) as string[];
  const match = typed.trim() === company.name;

  return (
    <SettingsSection
      id="danger"
      tone="danger"
      title="Close business account"
      description="Closing is free. Your statements and the activity log stay available for 7 years."
      footer={
        <>
          <span>This can&apos;t be undone. Reopening means a new application.</span>
          <Button size="sm" variant="danger-soft" onClick={() => setOpen(true)}>
            Close account…
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-2">
        Before closing, the balance must be zero, cards cancelled and no payments pending. We&apos;ll show you exactly what&apos;s left.
      </p>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setTyped("");
        }}
        title={`Close ${company.name}'s accounts?`}
        footer={
          <>
            <Button
              variant="secondary"
              autoFocus
              onClick={() => {
                setOpen(false);
                setTyped("");
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" disabled={!match || blockers.length > 0}>
              Close accounts
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {blockers.length > 0 && (
            <div className="rounded-lg bg-warning-soft p-3.5 shadow-[inset_0_0_0_1px_var(--color-warning-line)]">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-warning">
                <TriangleAlert className="size-4" />
                You can&apos;t close yet — {blockers.length} thing{blockers.length === 1 ? "" : "s"} left
              </p>
              <ul className="mt-2 flex flex-col gap-1 pl-5 text-[13px] text-ink-2">
                {blockers.map((b) => (
                  <li key={b} className="list-disc">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Input
            label={
              <span>
                Type <span className="font-semibold text-ink">{company.name}</span> to confirm
              </span>
            }
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
          />
          <p className="text-[12px] text-ink-3">Once nothing is left, the accounts close within 1 working day and you get a final statement.</p>
        </div>
      </Modal>
    </SettingsSection>
  );
}
