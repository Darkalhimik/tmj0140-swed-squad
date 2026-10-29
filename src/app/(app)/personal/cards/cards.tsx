"use client";

import { Eye, EyeOff, Globe, KeyRound, Landmark, Nfc, Plus, RefreshCw, ShoppingBag, Snowflake } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { CopyRow } from "@/components/banking/account-modals";
import { BankCard } from "@/components/banking/bank-card";
import { SmartIdModal } from "@/components/banking/smart-id";
import { FeeBreakdown } from "@/components/banking/transparency";
import { TxnDrawer, TxnRow } from "@/components/banking/txn";
import { SettingsRow, SettingsSection } from "@/components/personal/settings-section";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Choicebox } from "@/components/ui/choicebox";
import { Input } from "@/components/ui/input";
import { Meter } from "@/components/ui/meter";
import { EmptyState, Money, Note } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { Switch } from "@/components/ui/switch";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Card, Txn } from "@/lib/types";

type Signing = { action: string; details: { label: string; value: ReactNode }[]; onDone: () => void };
type SettingKey = keyof Card["settings"];

const SETTINGS: { key: SettingKey; label: string; icon: ReactNode; off: string; physicalOnly?: boolean }[] = [
  { key: "online", label: "Online payments", icon: <ShoppingBag className="size-4" />, off: "Off: web and in-app purchases are declined. Apple Pay in shops still works." },
  { key: "contactless", label: "Contactless", icon: <Nfc className="size-4" />, off: "Off: tap-to-pay is declined. Insert the card and enter your PIN instead.", physicalOnly: true },
  { key: "abroad", label: "Payments abroad", icon: <Globe className="size-4" />, off: "Off: payments outside Estonia are declined, including foreign online shops." },
  { key: "atm", label: "Cash withdrawals", icon: <Landmark className="size-4" />, off: "Off: ATM withdrawals are declined.", physicalOnly: true },
];

function cardLabel(c: Card) {
  return `${c.name} ••${c.last4}`;
}

export function Cards() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { cards, txns } = state.personal;

  const [selectedId, setSelectedId] = useState(cards[0]!.id);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "pin" | "replace" | "virtual" | { limit: number }>(null);
  const [signing, setSigning] = useState<Signing | null>(null);
  const [openTxn, setOpenTxn] = useState<Txn | null>(null);

  const card = (selectedId === "__last__" ? cards.at(-1) : cards.find((c) => c.id === selectedId)) ?? cards[0]!;
  const cardTxns = txns.filter((t) => t.cardId === card.id).slice(0, 6);
  const virtual = card.kind === "virtual";

  const onSigned = useCallback(() => {
    const s = signing;
    setSigning(null);
    s?.onDone();
  }, [signing]);

  const freeze = (next: boolean) => {
    dispatch({ type: "personal/card", id: card.id, patch: { frozen: next } });
    toast({
      title: next ? "Card frozen" : "Card unfrozen",
      description: next ? `${cardLabel(card)} · new payments are declined` : `${cardLabel(card)} · you can pay again`,
      action: { label: "Undo", onClick: () => dispatch({ type: "personal/card", id: card.id, patch: { frozen: !next } }) },
    });
  };

  const select = (id: string) => {
    setSelectedId(id);
    setRevealed(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Cards"
        description="Freeze, limit and control every card. Changes apply instantly."
        actions={
          <Button variant="primary" leading={<Plus className="size-4" />} onClick={() => setModal("virtual")}>
            Create virtual card
          </Button>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Card list */}
        <nav aria-label="Your cards" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {cards.map((c) => {
            const active = c.id === card.id;
            return (
              <button
                key={c.id}
                onClick={() => select(c.id)}
                aria-current={active}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl p-2.5 pr-4 text-left transition-[background-color,box-shadow]",
                  active ? "bg-surface shadow-card" : "hover:bg-muted/70",
                )}
              >
                <BankCard card={c} size="sm" className="w-[84px]! rounded-md!" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink">{c.name}</span>
                  <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
                    <span className="font-mono tracking-tight">••{c.last4}</span>
                    {c.frozen ? (
                      <Badge size="xs" tone="info">
                        Frozen
                      </Badge>
                    ) : c.kind === "virtual" ? (
                      <Badge size="xs" tone="gray">
                        Virtual
                      </Badge>
                    ) : null}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Detail */}
        <div className="flex min-w-0 flex-col gap-5">
          <section className="rounded-xl bg-surface p-5 shadow-card">
            <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_1fr] md:items-center">
              <BankCard card={card} size="lg" showNumber={revealed === card.id} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-[22px] font-semibold tracking-[-0.015em]">{card.name}</h2>
                  {card.frozen ? <Badge tone="info">Frozen</Badge> : <Badge tone="success">Active</Badge>}
                </div>
                <p className="mt-1 text-[13px] text-ink-3">
                  {card.network} · {card.kind === "credit" ? "Credit" : card.kind === "virtual" ? "Virtual" : "Debit"} · expires {card.expiry} ·{" "}
                  {card.kind === "credit" ? "own credit line" : "paid from Everyday account"}
                </p>
                {card.kind === "credit" && card.creditLimit && (
                  <p className="mt-2 text-[13px] text-ink-2">
                    <Money value={card.limits[0]!.used} className="font-medium" /> used of {money(card.creditLimit)} · statement 5 Nov · pay by 25 Nov
                    interest-free
                  </p>
                )}
                <div className="mt-5 grid max-w-[400px] grid-cols-4 gap-2">
                  <RoundAction
                    icon={<Snowflake className="size-5" />}
                    label={card.frozen ? "Unfreeze" : "Freeze"}
                    active={card.frozen}
                    onClick={() => freeze(!card.frozen)}
                  />
                  <RoundAction
                    icon={revealed === card.id ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    label={revealed === card.id ? "Hide" : "Details"}
                    onClick={() =>
                      revealed === card.id
                        ? setRevealed(null)
                        : setSigning({
                            action: `Show card details for ${cardLabel(card)}`,
                            details: [
                              { label: "Card", value: cardLabel(card) },
                              { label: "Shows", value: "Number, expiry and CVC" },
                            ],
                            onDone: () => setRevealed(card.id),
                          })
                    }
                  />
                  <RoundAction
                    icon={<KeyRound className="size-5" />}
                    label="PIN"
                    disabled={virtual}
                    onClick={() =>
                      setSigning({
                        action: `Show PIN for ${cardLabel(card)}`,
                        details: [{ label: "Card", value: cardLabel(card) }],
                        onDone: () => setModal("pin"),
                      })
                    }
                  />
                  <RoundAction icon={<RefreshCw className="size-5" />} label="Replace" onClick={() => setModal("replace")} />
                </div>
              </div>
            </div>

            {revealed === card.id && (
              <div className="mt-5 grid animate-pop-in gap-x-6 rounded-lg bg-subtle px-4 sm:grid-cols-3">
                <CopyRow label="Card number" value={`4573 1820 9921 ${card.last4}`} />
                <CopyRow label="Expires" value={card.expiry} />
                <CopyRow label="CVC" value={String((Number(card.last4) * 7) % 1000).padStart(3, "0")} />
              </div>
            )}
            {card.frozen && (
              <Note
                tone="info"
                className="mt-5"
                title="Card frozen — payments are declined until you unfreeze"
                action={
                  <Button size="sm" variant="secondary" onClick={() => freeze(false)}>
                    Unfreeze
                  </Button>
                }
              >
                Refunds and subscriptions you cancel still arrive. Freezing is free and you can undo it any time.
              </Note>
            )}
          </section>

          <SettingsSection title="Security" description="Turn off what you don't use. Each switch takes effect on the next payment attempt.">
            <div className="divide-y divide-line">
              {SETTINGS.map((s) => {
                const unavailable = virtual && s.physicalOnly;
                const on = card.settings[s.key] && !unavailable;
                return (
                  <SettingsRow
                    key={s.key}
                    icon={s.icon}
                    title={s.label}
                    muted={unavailable}
                    description={unavailable ? "Not available for virtual cards." : on ? "On" : s.off}
                  >
                    <Switch
                      checked={on}
                      disabled={unavailable}
                      label={s.label}
                      onChange={(v) => {
                        dispatch({ type: "personal/cardSetting", id: card.id, key: s.key, value: v });
                        toast({ title: `${s.label} turned ${v ? "on" : "off"}`, description: cardLabel(card) });
                      }}
                    />
                  </SettingsRow>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection title="Limits" description="Lowering a limit applies instantly. Raising one needs Smart-ID.">
            <div className="divide-y divide-line">
              {card.limits.map((l, i) => (
                <div key={l.label} className="flex flex-col gap-2 py-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{l.label}</p>
                      <p className="tabular text-[12px] text-ink-3">
                        {money(l.used)} of {money(l.max)} {l.period === "day" ? "today" : "this month"} · {money(Math.max(0, l.max - l.used))} left · resets{" "}
                        {l.period === "day" ? "at midnight" : "1 Nov"}
                      </p>
                    </div>
                    {!(card.kind === "credit" && i === 0) && (
                      <Button size="sm" variant="secondary" onClick={() => setModal({ limit: i })}>
                        Edit
                      </Button>
                    )}
                  </div>
                  <Meter value={l.used} max={l.max} />
                </div>
              ))}
            </div>
          </SettingsSection>

          <section className="rounded-xl bg-surface shadow-card">
            <div className="px-5 pt-5 pb-2">
              <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Recent payments with this card</h2>
            </div>
            {cardTxns.length === 0 ? (
              <EmptyState title="No payments yet" description="Payments made with this card will show up here within seconds." />
            ) : (
              <div className="px-2 pb-3">
                {cardTxns.map((t) => (
                  <TxnRow key={t.id} txn={t} showDate onClick={() => setOpenTxn(t)} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {typeof modal === "object" && modal !== null && (
        <LimitModal
          key={`${card.id}-${modal.limit}`}
          card={card}
          index={modal.limit}
          onClose={() => setModal(null)}
          onApply={(max, needsSign) => {
            const apply = () => {
              dispatch({ type: "personal/cardLimit", id: card.id, index: modal.limit, max });
              toast({ title: "Limit updated", description: `${card.limits[modal.limit]!.label}: ${money(max)} · ${cardLabel(card)}` });
            };
            setModal(null);
            if (needsSign)
              setSigning({
                action: `Raise ${card.limits[modal.limit]!.label.toLowerCase()} limit on ${cardLabel(card)}`,
                details: [
                  { label: "From", value: money(card.limits[modal.limit]!.max) },
                  { label: "To", value: money(max) },
                  { label: "Applies", value: "Immediately" },
                ],
                onDone: apply,
              });
            else apply();
          }}
        />
      )}

      <ReplaceModal
        open={modal === "replace"}
        card={card}
        onClose={() => setModal(null)}
        onConfirm={(reason, fee) => {
          setModal(null);
          setSigning({
            action: `Order a replacement for ${cardLabel(card)}`,
            details: [
              { label: "Reason", value: reason },
              { label: "Fee", value: money(fee) },
              { label: "Old card", value: reason === "Damaged" ? "Works until the new one is activated" : "Blocked now" },
            ],
            onDone: () => {
              if (reason !== "Damaged") dispatch({ type: "personal/card", id: card.id, patch: { frozen: true } });
              toast({ title: "Replacement ordered", description: `Arrives in 3–5 working days · fee ${money(fee)}` });
            },
          });
        }}
      />

      <VirtualCardModal
        open={modal === "virtual"}
        onClose={() => setModal(null)}
        onCreate={(name, limit) => {
          dispatch({ type: "personal/addCard", name, limit });
          setSelectedId("__last__");
          setModal(null);
          toast({ title: "Virtual card created", description: `${name} · limit ${money(limit)}/month · ready to use` });
        }}
      />

      <Modal open={modal === "pin"} onClose={() => setModal(null)} size="sm" title={`PIN for ••${card.last4}`} description="Make sure no one can see your screen.">
        <div className="flex justify-center gap-3 py-4">
          {String((Number(card.last4) * 13) % 10000)
            .padStart(4, "0")
            .split("")
            .map((d, i) => (
              <span key={i} className="tabular flex size-14 items-center justify-center rounded-xl bg-subtle font-mono text-[28px] font-semibold">
                {d}
              </span>
            ))}
        </div>
        <p className="pb-2 text-center text-[12px] text-ink-3">Hidden again when you close this window. Change it at any Swedbank ATM.</p>
      </Modal>

      <SmartIdModal
        open={!!signing}
        onClose={() => setSigning(null)}
        onConfirmed={onSigned}
        action={signing?.action ?? ""}
        details={signing?.details ?? []}
      />
      <TxnDrawer txn={openTxn} onClose={() => setOpenTxn(null)} cards={cards} />
    </PageContainer>
  );
}

function RoundAction({
  icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="group flex flex-col items-center gap-1.5 disabled:opacity-40">
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 group-active:scale-95",
          active ? "bg-info text-white" : "bg-cream text-brown group-hover:bg-muted",
        )}
      >
        {icon}
      </span>
      <span className="text-[12px] font-medium text-ink-2">{label}</span>
    </button>
  );
}

function LimitModal({
  card,
  index,
  onClose,
  onApply,
}: {
  card: Card;
  index: number;
  onClose: () => void;
  onApply: (max: number, needsSign: boolean) => void;
}) {
  const limit = card.limits[index]!;
  const [value, setValue] = useState(String(limit.max));
  const n = Number(value.replace(",", ".")) || 0;
  const presets = limit.period === "day" ? [500, 1000, 3000, 5000] : [100, 500, 2000, 5000];
  const raising = n > limit.max;

  return (
    <Modal
      open
      onClose={onClose}
      title={`${limit.label} limit`}
      description={`${card.name} ••${card.last4} · per ${limit.period}`}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!n || n === limit.max} onClick={() => onApply(n, raising)}>
            {raising ? "Continue With Smart-ID" : "Apply limit"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          size="lg"
          inputMode="decimal"
          prefix={<span className="text-[17px]">€</span>}
          className="font-display tabular text-[20px] font-semibold"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ""))}
          aria-label="New limit"
          autoFocus
        />
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setValue(String(p))}
              className={cn("h-8 rounded-full px-3 text-[13px] transition-colors", n === p ? "bg-brown text-white" : "bg-subtle text-ink-2 hover:bg-muted")}
            >
              {money(p, { compact: p >= 1000 })}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-ink-3">
          You’ve used <Money value={limit.used} className="font-medium text-ink-2" /> {limit.period === "day" ? "today" : "this month"}.{" "}
          {raising ? "Raising a limit needs Smart-ID and applies immediately after." : "Applies instantly."}
        </p>
        {n > 0 && n < limit.used && (
          <Note tone="warning">That’s below what you’ve already spent — further payments are declined until the limit resets.</Note>
        )}
      </div>
    </Modal>
  );
}

type Reason = "Damaged" | "Lost" | "Stolen";

function ReplaceModal({
  open,
  card,
  onClose,
  onConfirm,
}: {
  open: boolean;
  card: Card;
  onClose: () => void;
  onConfirm: (reason: Reason, fee: number) => void;
}) {
  const [reason, setReason] = useState<Reason>("Damaged");
  const fee = reason === "Stolen" ? 0 : 4;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Replace card"
      description={`${card.name} ••${card.last4}`}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onConfirm(reason, fee)}>
            Order Replacement · {money(fee)}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Choicebox<Reason>
          columns={3}
          value={reason}
          onChange={setReason}
          items={[
            { value: "Damaged", title: "Damaged", meta: <span className="tabular text-[12px] text-ink-3">€4.00</span> },
            { value: "Lost", title: "Lost", meta: <span className="tabular text-[12px] text-ink-3">€4.00</span> },
            { value: "Stolen", title: "Stolen", meta: <span className="text-[12px] text-success">Free</span> },
          ]}
        />
        <FeeBreakdown
          rows={[
            { label: "Replacement card", value: money(fee), tone: fee === 0 ? "success" : undefined, hint: "€4.00 per the price list. Free when the card was stolen and reported." },
            { label: "Delivery to your home address", value: "€0.00", tone: "success" },
          ]}
          total={{ label: "You pay", value: money(fee) }}
          arrival="Arrives in 3–5 working days · Apple Pay keeps working meanwhile"
        />
        <p className="text-[13px] text-ink-3">
          {reason === "Damaged"
            ? "Your current card keeps working until you activate the new one. The card number stays the same."
            : "Your current card is blocked as soon as you confirm. The new card has a new number — update it where it's saved (Bolt, Spotify)."}
        </p>
      </div>
    </Modal>
  );
}

function VirtualCardModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string, limit: number) => void }) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState<"50" | "150" | "500">("150");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create virtual card"
      description="For online shops and subscriptions. Ready in seconds."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={name.trim().length < 2}
            onClick={() => {
              onCreate(name.trim(), Number(limit));
              setName("");
            }}
          >
            Create card
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Card name" placeholder="e.g. Online shopping" value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} autoFocus />
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">Monthly limit</p>
          <Segmented<"50" | "150" | "500">
            value={limit}
            onChange={setLimit}
            items={[
              { value: "50", label: "€50" },
              { value: "150", label: "€150" },
              { value: "500", label: "€500" },
            ]}
          />
        </div>
        <FeeBreakdown
          rows={[
            { label: "Issuing fee", value: "€0.00", tone: "success" },
            { label: "Monthly fee", value: "€0.00", tone: "success" },
          ]}
          total={{ label: "You pay", value: "€0.00" }}
          arrival="Works online, in Apple Pay and Google Pay. Contactless and ATM are off for virtual cards."
        />
      </div>
    </Modal>
  );
}
