"use client";

import { CreditCard, Globe, Landmark, Nfc, ShoppingBag, Snowflake } from "lucide-react";
import { useState, type ReactNode } from "react";
import { BankCard } from "@/components/banking/bank-card";
import { FeeBreakdown } from "@/components/banking/transparency";
import { TxnRow } from "@/components/banking/txn";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Choicebox } from "@/components/ui/choicebox";
import { Input, Select } from "@/components/ui/input";
import { Meter } from "@/components/ui/meter";
import { EmptyState, Note } from "@/components/ui/misc";
import { Drawer, Modal } from "@/components/ui/overlay";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Card } from "@/lib/types";

export function cardOwnerName(card: Card, members: { id: string; name: string }[]) {
  return card.memberId ? (members.find((m) => m.id === card.memberId)?.name ?? card.holder) : "Shared virtual card";
}

const SETTINGS: { key: keyof Card["settings"]; label: string; icon: ReactNode; off: string }[] = [
  { key: "online", label: "Online payments", icon: <ShoppingBag className="size-4" />, off: "Web and in-app purchases will be declined." },
  { key: "contactless", label: "Contactless", icon: <Nfc className="size-4" />, off: "Tap to pay is off. Chip & PIN still works." },
  { key: "abroad", label: "Payments abroad", icon: <Globe className="size-4" />, off: "Only payments in Estonia will go through." },
  { key: "atm", label: "Cash withdrawals", icon: <Landmark className="size-4" />, off: "ATMs will decline this card." },
];

const FREEZE_REASONS = ["Card misplaced", "Employee on leave", "Suspicious payment", "Left the company"];

/** Card control sheet: freeze, limit, security toggles and recent spend. */
export function CardDrawer({ cardId, onClose }: { cardId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const card = state.business.cards.find((c) => c.id === cardId) ?? null;
  const [freezing, setFreezing] = useState(false);
  const [limitRaw, setLimitRaw] = useState<string | null>(null);

  const close = () => {
    setLimitRaw(null);
    onClose();
  };

  if (!card) return null;

  const owner = cardOwnerName(card, state.business.members);
  const limit = card.limits[0]!;
  const txns = state.business.txns.filter((t) => t.cardId === card.id);
  const newMax = limitRaw === null ? limit.max : Number(limitRaw) || 0;
  const limitError = limitRaw !== null && newMax < limit.used ? `Already ${money(limit.used)} spent this month` : undefined;

  return (
    <>
      <Drawer
        open={!!cardId}
        onClose={close}
        title={`${card.name} ••${card.last4}`}
        description={owner}
      >
        <div className="flex flex-col">
          <div className="flex flex-col items-center gap-4 border-b border-line px-6 pt-6 pb-5">
            <BankCard card={card} size="md" />
            <div className="flex w-full items-center justify-between rounded-lg bg-subtle px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Snowflake className={cn("size-4", card.frozen ? "text-info" : "text-ink-3")} />
                {card.frozen ? "Frozen — payments are declined" : "Freeze card"}
              </span>
              <Switch
                checked={card.frozen}
                label="Freeze card"
                onChange={(v) => {
                  if (v) setFreezing(true);
                  else {
                    dispatch({ type: "biz/card", id: card.id, patch: { frozen: false } });
                    toast({
                      title: "Card unfrozen",
                      description: `${owner} can pay with ••${card.last4} again`,
                      action: { label: "Undo", onClick: () => dispatch({ type: "biz/card", id: card.id, patch: { frozen: true }, reason: "Undo" }) },
                    });
                  }
                }}
              />
            </div>
          </div>

          <section className="border-b border-line px-6 py-5">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-ink-2">Monthly limit</p>
              <p className="tabular text-[13px] text-ink-2">
                {money(limit.used)} <span className="text-ink-4">of {money(limit.max)}</span>
              </p>
            </div>
            <Meter value={limit.used} max={limit.max} />
            <p className="mt-1.5 text-[12px] text-ink-3">
              {money(Math.max(0, limit.max - limit.used))} left · resets 1 Nov
            </p>
            {limitRaw === null ? (
              <Button className="mt-3" size="sm" variant="secondary" onClick={() => setLimitRaw(String(limit.max))}>
                Change limit
              </Button>
            ) : (
              <div className="mt-3 flex items-start gap-2">
                <Input
                  prefix="€"
                  inputMode="numeric"
                  size="sm"
                  className="tabular"
                  value={limitRaw}
                  autoFocus
                  onChange={(e) => setLimitRaw(e.target.value.replace(/\D/g, ""))}
                  error={limitError}
                  hint="Applies instantly. Recorded in the activity log."
                  wrapperClassName="w-36"
                />
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!!limitError || newMax === limit.max || newMax === 0}
                  onClick={() => {
                    dispatch({ type: "biz/cardLimit", id: card.id, max: newMax });
                    setLimitRaw(null);
                    toast({ title: "Limit updated", description: `${owner} · ${money(newMax)} per month` });
                  }}
                >
                  Save
                </Button>
                <Button size="sm" variant="tertiary" onClick={() => setLimitRaw(null)}>
                  Cancel
                </Button>
              </div>
            )}
          </section>

          <section className="border-b border-line px-6 py-3">
            {SETTINGS.map((s) => (
              <div key={s.key} className="flex items-start gap-3 py-2.5">
                <span className="mt-0.5 text-ink-3">{s.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{s.label}</p>
                  {!card.settings[s.key] && <p className="text-[12px] text-ink-3">{s.off}</p>}
                </div>
                <Switch
                  size="sm"
                  label={s.label}
                  checked={card.settings[s.key]}
                  disabled={card.kind === "virtual" && (s.key === "contactless" || s.key === "atm")}
                  onChange={(v) => {
                    dispatch({
                      type: "biz/card",
                      id: card.id,
                      patch: { settings: { ...card.settings, [s.key]: v } },
                      reason: `${s.label} ${v ? "on" : "off"}`,
                    });
                    toast({ title: `${s.label} turned ${v ? "on" : "off"}`, description: `${owner} ••${card.last4}` });
                  }}
                />
              </div>
            ))}
          </section>

          <section className="px-3 py-4">
            <p className="mb-1 px-3 text-[13px] font-medium text-ink-2">Recent payments</p>
            {txns.length === 0 ? (
              <EmptyState className="py-6" title="No payments this month" description="Payments made with this card appear here in real time." />
            ) : (
              txns.map((t) => <TxnRow key={t.id} txn={t} showDate />)
            )}
          </section>
          <p className="px-6 pb-6 text-[12px] text-ink-4">Card fee €2.00 per month, billed with your service fees on the 5th.</p>
        </div>
      </Drawer>

      <Modal open={freezing} onClose={() => setFreezing(false)} size="sm" title="Freeze card" description={`${owner} ••${card.last4}`}>
        {freezing && (
          <FreezeBody
            onCancel={() => setFreezing(false)}
            onConfirm={(reason) => {
              dispatch({ type: "biz/card", id: card.id, patch: { frozen: true }, reason: `Reason: ${reason}` });
              setFreezing(false);
              toast({ title: "Card frozen", description: `${owner} has been notified · unfreeze any time` });
            }}
          />
        )}
      </Modal>
    </>
  );
}

function FreezeBody({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState(FREEZE_REASONS[0]!);
  return (
    <div className="flex flex-col gap-4 pb-1">
      <p className="text-[13px] text-ink-3">New payments are declined instantly. Subscriptions on this card will fail until you unfreeze it.</p>
      <div className="flex flex-wrap gap-1.5">
        {FREEZE_REASONS.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={cn("h-7 rounded-full px-3 text-[12px] transition-colors", reason === r ? "bg-brown text-white" : "bg-subtle text-ink-2 hover:bg-muted")}
          >
            {r}
          </button>
        ))}
      </div>
      {reason === "Suspicious payment" && (
        <Note tone="warning">Don&apos;t recognise a payment? Freeze the card and call 613 2222.</Note>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="tertiary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" leading={<Snowflake className="size-4" />} onClick={() => onConfirm(reason)}>
          Freeze card
        </Button>
      </div>
    </div>
  );
}

/** Issue a physical card for a team member or a shared virtual card. */
export function IssueCardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Issue a card" description="Virtual right away, plastic in 3–5 days.">
      {open && <IssueBody onClose={onClose} />}
    </Modal>
  );
}

function IssueBody({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const eligible = state.business.members.filter((m) => m.role !== "viewer" && m.role !== "accountant");
  const [kind, setKind] = useState<"member" | "virtual">("member");
  const [memberId, setMemberId] = useState(eligible.find((m) => !state.business.cards.some((c) => c.memberId === m.id))?.id ?? eligible[0]?.id ?? "");
  const [name, setName] = useState("Marketing tools");
  const [limitRaw, setLimitRaw] = useState("1000");
  const limit = Number(limitRaw) || 0;
  const member = state.business.members.find((m) => m.id === memberId);
  const valid = limit > 0 && (kind === "virtual" ? name.trim().length > 1 : !!member);

  return (
    <div className="flex flex-col gap-5 pb-1">
      <Choicebox<"member" | "virtual">
        value={kind}
        onChange={setKind}
        items={[
          { value: "member", title: "For a team member", description: "Physical + virtual, in their name", icon: <CreditCard className="size-4" /> },
          { value: "virtual", title: "Shared virtual card", description: "For subscriptions and online tools", icon: <ShoppingBag className="size-4" /> },
        ]}
      />
      {kind === "member" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="issue-member" className="text-[13px] font-medium text-ink-2">
            Cardholder
          </label>
          <Select id="issue-member" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            {eligible.map((m) => {
              const has = state.business.cards.filter((c) => c.memberId === m.id).length;
              return (
                <option key={m.id} value={m.id}>
                  {m.name} {has ? `· has ${has} card` : ""}
                </option>
              );
            })}
          </Select>
          {member && (
            <p className="flex items-center gap-1.5 text-[12px] text-ink-3">
              <Avatar name={member.name} size="xs" />
              {member.title} · delivered to Telliskivi 60a/3, Tallinn
            </p>
          )}
        </div>
      ) : (
        <Input label="Card name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marketing tools" />
      )}
      <Input
        label="Monthly limit"
        prefix="€"
        inputMode="numeric"
        className="tabular"
        value={limitRaw}
        onChange={(e) => setLimitRaw(e.target.value.replace(/\D/g, ""))}
        hint="You can change it any time. Spending above it is declined."
      />
      <FeeBreakdown
        rows={[
          { label: "Issue fee", value: kind === "member" ? money(4) : "€0.00", hint: "The company's first debit card is free to issue; later cards €4.00" },
          { label: "Monthly card fee", value: money(2) },
        ]}
        total={{ label: "Due today", value: kind === "member" ? money(4) : "€0.00" }}
        arrival={kind === "member" ? "Virtual card ready now · physical card in 3–5 business days" : "Ready now — add it to Apple Pay or Google Pay"}
      />
      <div className="flex justify-end gap-2">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!valid}
          onClick={() => {
            dispatch({
              type: "biz/issueCard",
              memberId: kind === "member" ? memberId : null,
              name: kind === "member" ? "Visa Business" : name.trim(),
              limit,
            });
            onClose();
            toast({
              title: "Card issued",
              description: kind === "member" ? `${member?.name} can use it in Apple Pay now` : `${name.trim()} is ready to use`,
            });
          }}
        >
          Issue card
        </Button>
      </div>
    </div>
  );
}
