"use client";

import { X } from "lucide-react";
import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { Button } from "@/components/ui/button";
import { Choicebox } from "@/components/ui/choicebox";
import { Field } from "@/components/ui/input";
import { Drawer } from "@/components/ui/overlay";
import { Switch } from "@/components/ui/switch";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { roleMeta } from "@/lib/data/business";
import { fmtDate, NOW } from "@/lib/format";
import { useCompany, useStore } from "@/lib/store";
import type { RoleId } from "@/lib/types";
import { capabilities } from "./team-shared";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INVITABLE: RoleId[] = ["admin", "accountant", "employee", "viewer"];
const EXPIRES = new Date(NOW.getTime() + 7 * 86_400_000).toISOString();

export function InviteDrawer({ open, onClose, onSent }: { open: boolean; onClose: () => void; onSent: () => void }) {
  if (!open) return null;
  return <InviteDrawerInner onClose={onClose} onSent={onSent} />;
}

function InviteDrawerInner({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const company = useCompany();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<RoleId>("employee");
  const [limit, setLimit] = useState<"2000" | "5000" | "10000">("5000");
  const [card, setCard] = useState(true);
  const [signing, setSigning] = useState(false);

  const taken = new Set([...state.business.members.map((m) => m.email), ...state.business.invites.map((i) => i.email)]);
  const invalid = emails.filter((e) => !EMAIL.test(e));
  const duplicate = emails.filter((e) => EMAIL.test(e) && taken.has(e));
  const ready = emails.filter((e) => EMAIL.test(e) && !taken.has(e));
  const canCard = role === "employee" || role === "admin";
  const withCard = canCard && card;
  const people = `${ready.length} invite${ready.length === 1 ? "" : "s"}`;

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        title="Invite people"
        description={`They join ${company.name} and sign in with their own Smart-ID, Mobile-ID or ID-card.`}
        footer={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-4 text-ink-3">
              {ready.length ? (
                <>
                  <span className="font-medium text-ink-2">{people}</span> · {roleMeta[role].label}
                  {withCard && " · with card"} · expires {fmtDate(EXPIRES)}
                </>
              ) : (
                "Add at least one email address"
              )}
            </p>
            <div className="flex gap-2 self-end">
              <Button variant="tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!ready.length || invalid.length > 0} onClick={() => setSigning(true)}>
                Review & sign
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6 px-5 py-5">
          <Field
            label="Email addresses"
            hint="Paste a list or separate with commas. Each person gets a personal link."
            error={
              invalid.length
                ? `Check ${invalid.join(", ")} — that doesn't look like an email address.`
                : duplicate.length
                  ? `${duplicate.join(", ")} already ${duplicate.length > 1 ? "have" : "has"} access or an open invitation and will be skipped.`
                  : undefined
            }
          >
            <EmailChips emails={emails} onChange={setEmails} taken={taken} />
          </Field>

          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-medium text-ink-2">Role</p>
            <Choicebox<RoleId>
              columns={1}
              value={role}
              onChange={setRole}
              items={INVITABLE.map((r) => ({
                value: r,
                title: roleMeta[r].label,
                meta: <span className="text-[12px] text-ink-4">{roleMeta[r].rights}</span>,
                description: (
                  <>
                    {roleMeta[r].description}
                    <span className="mt-1 block text-ink-4">Can {capabilities(r).join(" · ")}</span>
                  </>
                ),
              }))}
            />
            <p className="text-[12px] text-ink-3">
              Owner is reserved for management board members listed in the e-Business Register.
            </p>
          </div>

          {role === "admin" && (
            <Field label="Approval limit" hint="Admins approve payments up to this amount alone. Above it, a board member signs too.">
              <Segmented
                value={limit}
                onChange={setLimit}
                size="sm"
                items={[
                  { value: "2000", label: "€2,000" },
                  { value: "5000", label: "€5,000" },
                  { value: "10000", label: "€10,000" },
                ]}
              />
            </Field>
          )}

          {canCard && (
            <div className="flex items-start justify-between gap-4 rounded-lg bg-subtle p-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <div>
                <p className="text-sm font-medium text-ink">Issue a business debit card</p>
                <p className="mt-0.5 text-[12px] leading-4 text-ink-3">
                  Virtual card ready when they accept, physical card in 3–5 days. €2.00 per card per month · €1,000/month spending limit you can change later.
                </p>
              </div>
              <Switch checked={card} onChange={setCard} label="Issue a card" />
            </div>
          )}
        </div>
      </Drawer>

      <SmartIdModal
        open={signing}
        onClose={() => setSigning(false)}
        action={`Invite ${people} to ${company.name}`}
        details={[
          { label: "People", value: ready.join(", ") },
          { label: "Role", value: `${roleMeta[role].label} · ${roleMeta[role].rights}` },
          ...(role === "admin" ? [{ label: "Approval limit", value: `€${Number(limit).toLocaleString("en-IE")}` }] : []),
          ...(withCard ? [{ label: "Card", value: "Business debit · €2.00/month each" }] : []),
          { label: "Invitation expires", value: fmtDate(EXPIRES, "long") },
        ]}
        onConfirmed={() => {
          dispatch({ type: "biz/invite", emails: ready, role });
          setSigning(false);
          toast({
            title: ready.length > 1 ? "Invitations sent" : "Invitation sent",
            description: `${ready.join(", ")} · ${roleMeta[role].label}${withCard ? " · card issued on acceptance" : ""}`,
          });
          // Close the drawer after the Smart-ID dialog has unmounted, so body scroll locks unwind in order.
          window.setTimeout(() => {
            onSent();
            onClose();
          }, 0);
        }}
      />
    </>
  );
}

function EmailChips({ emails, onChange, taken }: { emails: string[]; onChange: (next: string[]) => void; taken: Set<string> }) {
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const commit = (raw: string) => {
    const parts = raw
      .split(/[\s,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (parts.length) onChange([...emails, ...parts.filter((p, i) => !emails.includes(p) && parts.indexOf(p) === i)]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      if (draft.trim()) {
        e.preventDefault();
        commit(draft);
      }
    } else if (e.key === "Backspace" && !draft && emails.length) {
      onChange(emails.slice(0, -1));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    commit(draft + " " + e.clipboardData.getData("text"));
  };

  return (
    <div
      onClick={() => input.current?.focus()}
      className="flex min-h-10 cursor-text flex-wrap items-center gap-1.5 rounded-md bg-surface px-2 py-1.5 shadow-[0_0_0_1px_var(--color-line-strong)] transition-shadow focus-within:shadow-[0_0_0_1px_var(--color-ink-3),0_0_0_4px_rgb(81_43_43/0.06)]"
    >
      {emails.map((e) => {
        const bad = !EMAIL.test(e);
        const dup = !bad && taken.has(e);
        return (
          <span
            key={e}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-full pr-1 pl-2.5 text-[12px]",
              bad ? "bg-danger-soft text-danger" : dup ? "bg-warning-soft text-warning" : "bg-muted text-ink",
            )}
          >
            {e}
            <button
              type="button"
              aria-label={`Remove ${e}`}
              onClick={(ev) => {
                ev.stopPropagation();
                onChange(emails.filter((x) => x !== e));
              }}
              className="flex size-4 items-center justify-center rounded-full hover:bg-black/10"
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}
      <input
        ref={input}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          if (/[,;\s]$/.test(v)) commit(v);
          else setDraft(v);
        }}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => draft.trim() && commit(draft)}
        placeholder={emails.length ? "" : "oliver@nordlight.ee, finance@arvestus.ee"}
        className="h-7 min-w-40 flex-1 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-ink-4"
        autoFocus
        type="text"
        inputMode="email"
        aria-label="Email addresses"
      />
    </div>
  );
}
