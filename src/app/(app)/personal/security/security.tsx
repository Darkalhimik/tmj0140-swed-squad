"use client";

import {
  Bell,
  CreditCard,
  Download,
  Fingerprint,
  Lock,
  Monitor,
  Smartphone,
  SmartphoneNfc,
  Tablet,
  UserRound,
} from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { SettingsRow, SettingsSection } from "@/components/personal/settings-section";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Meter } from "@/components/ui/meter";
import { Money, Note, Tooltip } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { consents as seedConsents, devices as seedDevices, person } from "@/lib/data/personal";
import { cn } from "@/lib/cn";
import { downloadText } from "@/lib/export/download";
import { useStore } from "@/lib/store";
import { fmtDate, money, NOW, relative } from "@/lib/format";

type Channel = "app" | "push" | "email";
type Pref = { key: string; label: string; detail: string; locked?: boolean; values: Record<Channel, boolean> };

const PREFS: Pref[] = [
  { key: "card", label: "Card payments", detail: "Every payment and decline, with the merchant", values: { app: true, push: true, email: false } },
  { key: "in", label: "Money received", detail: "Salary, transfers and refunds", values: { app: true, push: true, email: false } },
  { key: "low", label: "Low balance", detail: "When Everyday account drops below €100", values: { app: true, push: true, email: true } },
  { key: "large", label: "Large payments", detail: "Any payment over €500", values: { app: true, push: true, email: true } },
  { key: "einvoice", label: "New e-invoices", detail: "3 days before the due date", values: { app: true, push: false, email: true } },
  { key: "signin", label: "New sign-in or device", detail: "Security alert", locked: true, values: { app: true, push: true, email: true } },
  { key: "limits", label: "Changes to limits or contact details", detail: "Security alert", locked: true, values: { app: true, push: true, email: true } },
  { key: "news", label: "Product news and offers", detail: "Off unless you turn it on", values: { app: false, push: false, email: false } },
];

type Limit = { key: string; label: string; used: number; max: number; period: string };

const LIMITS: Limit[] = [
  { key: "daily", label: "Payments per day", used: 120, max: 5000, period: "today" },
  { key: "monthly", label: "Payments per month", used: 1873.8, max: 15000, period: "this month" },
  { key: "instant", label: "Single instant payment", used: 0, max: 5000, period: "per payment" },
];

type Signing = { action: string; details: { label: string; value: ReactNode }[]; onDone: () => void };

export function Security() {
  const toast = useToast();
  const { state } = useStore();
  const [devices, setDevices] = useState(seedDevices);
  const [consents, setConsents] = useState(seedConsents);
  const [prefs, setPrefs] = useState(PREFS);
  const [limits, setLimits] = useState(LIMITS);
  const [revoking, setRevoking] = useState<(typeof seedConsents)[number] | null>(null);
  const [editing, setEditing] = useState<Limit | null>(null);
  const [signing, setSigning] = useState<Signing | null>(null);

  const onSigned = useCallback(() => {
    const s = signing;
    setSigning(null);
    s?.onDone();
  }, [signing]);

  const others = devices.filter((d) => !d.current);

  return (
    <PageContainer>
      <PageHeader title="Privacy & security" description="Who can reach your money and data — and how to change it." />

      <div className="flex flex-col gap-5">
        <SettingsSection
          title="Devices & sessions"
          description="Everywhere you're signed in right now. If you don't recognise one, sign it out and change your Smart-ID PINs."
          footer={
            <>
              <span>
                {others.length} other {others.length === 1 ? "session" : "sessions"}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={others.length === 0}
                onClick={() => {
                  setDevices((d) => d.filter((x) => x.current));
                  toast({ title: "Sessions ended", description: "Every other device needs to sign in again" });
                }}
              >
                Sign out other devices
              </Button>
            </>
          }
        >
          <div className="divide-y divide-line">
            {devices.map((d) => (
              <SettingsRow
                key={d.id}
                icon={d.name.includes("iPhone") ? <Smartphone className="size-4" /> : d.name.includes("iPad") ? <Tablet className="size-4" /> : <Monitor className="size-4" />}
                title={
                  <span className="flex items-center gap-2">
                    {d.name}
                    {d.current && (
                      <Badge size="xs" tone="success">
                        This device
                      </Badge>
                    )}
                  </span>
                }
                description={`${d.place} · ${d.method} · ${d.current ? "active now" : `last active ${relative(d.lastSeen)}`}`}
              >
                {!d.current && (
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() => {
                      setDevices((list) => list.filter((x) => x.id !== d.id));
                      toast({ title: "Session ended", description: d.name });
                    }}
                  >
                    Sign out
                  </Button>
                )}
              </SettingsRow>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="Sign-in methods" description="Any of these can sign you in. Payments and agreements are always confirmed with Smart-ID, Mobile-ID or ID-card.">
          <div className="divide-y divide-line">
            <SettingsRow icon={<SmartphoneNfc className="size-4" />} title="Smart-ID" description="iPhone 16 · used today at 10:20">
              <Badge tone="success">Active</Badge>
            </SettingsRow>
            <SettingsRow icon={<Fingerprint className="size-4" />} title="Face ID in the Swedbank app" description="Sign in only — payments still need Smart-ID PIN2">
              <Badge tone="success">On</Badge>
            </SettingsRow>
            <SettingsRow icon={<Smartphone className="size-4" />} title="Mobile-ID" description="Not set up · works with Telia, Elisa and Tele2 SIM cards">
              <Button size="sm" variant="secondary" onClick={() => toast({ title: "Mobile-ID guide opened", tone: "info", description: "Order Mobile-ID from your operator, then add it here" })}>
                Set up
              </Button>
            </SettingsRow>
            <SettingsRow icon={<CreditCard className="size-4" />} title="ID-card" description="Needs a card reader · expires 03/2029">
              <Badge tone="gray">Available</Badge>
            </SettingsRow>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Apps with access to your account"
          description="Services you've allowed to read your data or start payments (PSD2). You can revoke access any time — it stops immediately."
        >
          <div className="divide-y divide-line">
            {consents.map((c) => {
              const expired = "expired" in c && c.expired;
              const daysLeft = Math.ceil((new Date(c.expires).getTime() - NOW.getTime()) / 86_400_000);
              return (
                <div key={c.id} className={cn("flex flex-col gap-3 py-4 sm:flex-row sm:items-center", expired && "opacity-60")}>
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Avatar name={c.app} size="md" square />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {c.app}
                        {expired ? (
                          <Badge size="xs" tone="gray">
                            Expired
                          </Badge>
                        ) : daysLeft <= 30 ? (
                          <Badge size="xs" tone="warning">
                            Expires in {daysLeft} days
                          </Badge>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-[13px] text-ink-2">{c.purpose}</p>
                      <p className="mt-0.5 text-[12px] text-ink-3">
                        {c.scope} · granted {fmtDate(c.granted, "long")} · {expired ? "expired" : "expires"} {fmtDate(c.expires, "long")} · last used{" "}
                        {relative(c.lastUsed)}
                      </p>
                    </div>
                  </div>
                  {!expired && (
                    <Button size="sm" variant="secondary" className="self-start sm:self-center" onClick={() => setRevoking(c)}>
                      Revoke access
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Notifications"
          description="Choose how we reach you. Offers are off unless you turn them on."
          footer={<span>Push notifications go to the Swedbank app on iPhone 16. Email goes to {person.email}.</span>}
        >
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-[12px] text-ink-3">
                  <th className="py-2 font-medium">Event</th>
                  {(["In app", "Push", "Email"] as const).map((h) => (
                    <th key={h} className="w-20 py-2 text-center font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {prefs.map((p) => (
                  <tr key={p.key}>
                    <td className="py-3 pr-4">
                      <p className="flex items-center gap-1.5 font-medium text-ink">
                        {p.label}
                        {p.locked && (
                          <Tooltip content="Security alerts can't be turned off — they're how we reach you if someone else gets in.">
                            <Lock className="size-3.5 text-ink-3" aria-label="Always on" />
                          </Tooltip>
                        )}
                      </p>
                      <p className="text-[12px] text-ink-3">{p.detail}</p>
                    </td>
                    {(["app", "push", "email"] as Channel[]).map((ch) => (
                      <td key={ch} className="py-3 text-center">
                        <Check
                          checked={p.values[ch]}
                          disabled={p.locked}
                          label={`${p.label} by ${ch}`}
                          onChange={(v) => {
                            setPrefs((list) => list.map((x) => (x.key === p.key ? { ...x, values: { ...x.values, [ch]: v } } : x)));
                            toast({ title: "Notification settings saved", description: `${p.label} · ${ch === "app" ? "in app" : ch} ${v ? "on" : "off"}` });
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Payment limits"
          description="Caps on what can leave your accounts. Raising a limit needs Smart-ID; lowering applies instantly. Card limits are on each card."
        >
          <div className="divide-y divide-line">
            {limits.map((l) => (
              <div key={l.key} className="flex flex-col gap-2 py-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{l.label}</p>
                    <p className="tabular text-[12px] text-ink-3">
                      {l.period === "per payment" ? `Up to ${money(l.max)} per payment · larger amounts go as standard SEPA` : `${money(l.used)} of ${money(l.max)} ${l.period}`}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setEditing(l)}>
                    Change
                  </Button>
                </div>
                {l.period !== "per payment" && <Meter value={l.used} max={l.max} />}
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Your data"
          description="What we hold about you and when it was last confirmed. We review it regularly, as anti-money-laundering rules require."
          action={
            <Button
              size="sm"
              variant="secondary"
              leading={<Download className="size-4" />}
              onClick={() => {
                const filename = `my-data-${person.idCode.slice(-4)}-2026-10-29.json`;
                const data = {
                  _notice: "SPECIMEN — student concept by SWED SQUAD (TMJ0140/TMJ0130). Not a Swedbank document. All data is fictional.",
                  exportedAt: NOW.toISOString(),
                  format: "GDPR Art. 15 & 20 data export (machine-readable)",
                  person,
                  accounts: state.personal.accounts.map(({ id, name, kind, iban, balance }) => ({ id, name, kind, iban, balance })),
                  cards: state.personal.cards.map((c) => ({ name: c.name, last4: c.last4, kind: c.kind, frozen: c.frozen, settings: c.settings, limits: c.limits })),
                  transactions: state.personal.txns,
                  thirdPartyAccess: seedConsents,
                  devices: seedDevices,
                };
                downloadText(filename, JSON.stringify(data, null, 2), "application/json");
                toast({ title: "Data downloaded", description: `${filename} · everything we hold, machine-readable` });
              }}
            >
              Download my data
            </Button>
          }
          footer={
            <>
              <span>Next review due March 2027 — we’ll remind you a month before.</span>
              <Button size="sm" variant="tertiary" onClick={() => toast({ title: "Details form opened", tone: "info", description: "Update and confirm with Smart-ID" })}>
                Update details
              </Button>
            </>
          }
        >
          <dl className="divide-y divide-line">
            {[
              { label: "Name and personal code", value: `${person.name} · ${person.idCode}`, at: "From the Population Register", icon: <UserRound className="size-4" /> },
              { label: "Contact details", value: `${person.phone} · ${person.email}`, at: "Confirmed 12 Mar 2026", icon: <Bell className="size-4" /> },
              { label: "Address and tax residency", value: "Tallinn, Estonia · tax resident in Estonia", at: "Confirmed 14 Mar 2025", icon: <UserRound className="size-4" /> },
              { label: "Source of income", value: "Salary · Nordlight Studio OÜ", at: "Confirmed 14 Mar 2025", icon: <UserRound className="size-4" /> },
              { label: "Marketing consents", value: "None given", at: "You can change this any time", icon: <Bell className="size-4" /> },
            ].map((r) => (
              <SettingsRow key={r.label} icon={r.icon} title={r.label} description={r.value}>
                <span className="hidden text-right text-[12px] text-ink-3 sm:block">{r.at}</span>
              </SettingsRow>
            ))}
          </dl>
        </SettingsSection>
      </div>

      <Modal
        open={!!revoking}
        onClose={() => setRevoking(null)}
        size="sm"
        title={revoking ? `Revoke access for ${revoking.app}?` : ""}
        footer={
          <>
            <Button variant="secondary" autoFocus onClick={() => setRevoking(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!revoking) return;
                setConsents((list) => list.map((c) => (c.id === revoking.id ? { ...c, expired: true, expires: NOW.toISOString().slice(0, 10) } : c)));
                toast({ title: "Access revoked", description: `${revoking.app} can no longer reach your account` });
                setRevoking(null);
              }}
            >
              Revoke access
            </Button>
          </>
        }
      >
        {revoking && (
          <div className="flex flex-col gap-3 text-sm text-ink-2">
            <p>
              {revoking.app} stops being able to <span className="lowercase">{revoking.purpose}</span> immediately.
            </p>
            <Note tone="gray">Data already shared stays with {revoking.app} under their privacy policy. Ask them directly to delete it.</Note>
          </div>
        )}
      </Modal>

      {editing && (
        <LimitModal
          key={editing.key}
          limit={editing}
          onClose={() => setEditing(null)}
          onApply={(max) => {
            const l = editing;
            setEditing(null);
            const apply = () => {
              setLimits((list) => list.map((x) => (x.key === l.key ? { ...x, max } : x)));
              toast({ title: "Limit updated", description: `${l.label}: ${money(max)}` });
            };
            if (max > l.max)
              setSigning({
                action: `Raise limit: ${l.label.toLowerCase()}`,
                details: [
                  { label: "From", value: money(l.max) },
                  { label: "To", value: money(max) },
                  { label: "Applies", value: "Immediately" },
                ],
                onDone: apply,
              });
            else apply();
          }}
        />
      )}

      <SmartIdModal open={!!signing} onClose={() => setSigning(null)} onConfirmed={onSigned} action={signing?.action ?? ""} details={signing?.details ?? []} />
    </PageContainer>
  );
}

function Check({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-[5px] transition-colors disabled:cursor-not-allowed",
        checked ? "bg-brown text-white" : "bg-surface shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink-4)]",
        disabled && checked && "bg-ink-4",
      )}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
          <path d="M2.5 6.2l2.2 2.2 4.8-4.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function LimitModal({ limit, onClose, onApply }: { limit: Limit; onClose: () => void; onApply: (max: number) => void }) {
  const [value, setValue] = useState(String(limit.max));
  const n = Number(value.replace(",", ".")) || 0;
  const cap = limit.key === "monthly" ? 50000 : 15000;
  const raising = n > limit.max;
  return (
    <Modal
      open
      onClose={onClose}
      title={limit.label}
      description={`Currently ${money(limit.max)}`}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!n || n === limit.max || n > cap} onClick={() => onApply(n)}>
            {raising ? "Continue With Smart-ID" : "Apply limit"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          size="lg"
          inputMode="decimal"
          prefix={<span className="text-[17px]">€</span>}
          className="tabular text-[20px] font-semibold"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ""))}
          error={n > cap ? `Online you can set up to ${money(cap)}. For more, call +372 6 310 310.` : undefined}
          aria-label="New limit"
          autoFocus
        />
        <p className="text-[13px] text-ink-3">
          {limit.period !== "per payment" && (
            <>
              You’ve used <Money value={limit.used} className="font-medium text-ink-2" /> {limit.period}.{" "}
            </>
          )}
          {raising ? "Raising a limit needs Smart-ID and applies right after." : "Lowering applies instantly."}
        </p>
      </div>
    </Modal>
  );
}
