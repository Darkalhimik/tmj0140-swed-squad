"use client";

import { History, MoreHorizontal, ShieldCheck, Trash2, UserCog, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Choicebox } from "@/components/ui/choicebox";
import { Input } from "@/components/ui/input";
import { Menu } from "@/components/ui/menu";
import { Note, Tooltip } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { StatusDot } from "@/components/ui/status-dot";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { company, companyLimits, roleMeta } from "@/lib/data/business";
import { fmtDateTime, money, NOW, relative } from "@/lib/format";
import { CURRENT_MEMBER, useStore } from "@/lib/store";
import type { Member, RoleId } from "@/lib/types";
import { AuthMethod, capabilities, permissionDiff, ROLE_ORDER, signingLines } from "./team-shared";

type Dialog = { kind: "role" | "limit" | "remove"; member: Member } | null;
type Signing = {
  action: string;
  details: { label: string; value: string }[];
  run: () => void;
  toast: { title: string; description: string };
} | null;

const AGREEMENT = { label: "Agreement", value: "Digital Services Agreement · amendment" };
const EFFECT = { label: "Takes effect", value: "Immediately after signing" };

function activeRecently(m: Member) {
  return NOW.getTime() - new Date(m.lastActiveAt).getTime() < 60 * 60 * 1000;
}

export function MembersTable() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [signing, setSigning] = useState<Signing>(null);
  const members = [...state.business.members].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

  const sign = (s: NonNullable<Signing>) => {
    setDialog(null);
    setSigning(s);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-surface shadow-card">
        <div className="hidden grid-cols-[minmax(0,2.3fr)_minmax(0,1.3fr)_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,0.9fr)_40px] gap-4 border-b border-line bg-canvas px-5 py-2.5 text-[12px] font-medium text-ink-3 md:grid">
          <span>Member</span>
          <span>Role</span>
          <span>Signing & approvals</span>
          <span>Signs in with</span>
          <span>Last active</span>
          <span />
        </div>
        <ul className="divide-y divide-line">
          {members.map((m) => {
            const you = m.id === CURRENT_MEMBER;
            const [sign1, sign2] = signingLines(m);
            const canLimit = m.role === "admin";
            return (
              <li
                key={m.id}
                className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-x-4 gap-y-2 px-5 py-3.5 md:grid-cols-[minmax(0,2.3fr)_minmax(0,1.3fr)_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,0.9fr)_40px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={m.name} size="md" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                      {m.name}
                      {you && (
                        <Badge size="xs" tone="gray">
                          You
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-[12px] text-ink-3">
                      {m.email}
                      {m.external && <span className="text-ink-4"> · {m.external}</span>}
                    </p>
                  </div>
                </div>

                <div className="col-start-2 row-start-1 flex justify-end md:hidden">
                  <MemberMenu member={m} you={you} canLimit={canLimit} onOpen={setDialog} onActivity={() => router.push(`/business/activity?actor=${m.id}`)} />
                </div>

                <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-11 text-[12px] text-ink-3 md:hidden">
                  <span className="font-medium text-ink-2">{roleMeta[m.role].label}</span>
                  <span>{sign2}</span>
                  <span>{m.auth}</span>
                  <span>{relative(m.lastActiveAt)}</span>
                </div>

                <div className="hidden min-w-0 md:block">
                  <p className="text-sm font-medium text-ink">{roleMeta[m.role].label}</p>
                  <p className="truncate text-[12px] text-ink-3">{roleMeta[m.role].rights}</p>
                </div>
                <div className="hidden min-w-0 md:block">
                  <p className="truncate text-[13px] text-ink-2">{sign1}</p>
                  <p className="truncate text-[12px] text-ink-3">{sign2}</p>
                </div>
                <div className="hidden md:block">
                  <AuthMethod method={m.auth} />
                </div>
                <div className="hidden md:block">
                  <Tooltip content={fmtDateTime(m.lastActiveAt)}>
                    {activeRecently(m) ? (
                      <StatusDot status="ready" label={relative(m.lastActiveAt)} />
                    ) : (
                      <span className="tabular text-[13px] text-ink-3">{relative(m.lastActiveAt)}</span>
                    )}
                  </Tooltip>
                </div>
                <div className="hidden justify-end md:flex">
                  <MemberMenu member={m} you={you} canLimit={canLimit} onOpen={setDialog} onActivity={() => router.push(`/business/activity?actor=${m.id}`)} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {dialog?.kind === "role" && (
        <RoleDialog
          member={dialog.member}
          onClose={() => setDialog(null)}
          onSign={(role) =>
            sign({
              action: `Change role of ${dialog.member.name}`,
              details: [
                { label: "Role", value: `${roleMeta[dialog.member.role].label} → ${roleMeta[role].label}` },
                { label: "Rights profile", value: roleMeta[role].rights },
                AGREEMENT,
                EFFECT,
              ],
              run: () => dispatch({ type: "biz/memberRole", id: dialog.member.id, role }),
              toast: { title: "Role updated", description: `${dialog.member.name} is now ${roleMeta[role].label} · logged in Activity` },
            })
          }
        />
      )}
      {dialog?.kind === "limit" && (
        <LimitDialog
          member={dialog.member}
          onClose={() => setDialog(null)}
          onSign={(limit) =>
            sign({
              action: `Change approval limit of ${dialog.member.name}`,
              details: [
                {
                  label: "Approval limit",
                  value: `${dialog.member.approvalLimit === null ? "No limit" : money(dialog.member.approvalLimit)} → ${limit === null ? "No limit" : money(limit)}`,
                },
                AGREEMENT,
                EFFECT,
              ],
              run: () => dispatch({ type: "biz/memberLimit", id: dialog.member.id, limit }),
              toast: { title: "Approval limit updated", description: `${dialog.member.name} · ${limit === null ? "no limit" : `up to ${money(limit)}`}` },
            })
          }
        />
      )}
      {dialog?.kind === "remove" && (
        <RemoveDialog
          member={dialog.member}
          onClose={() => setDialog(null)}
          onSign={() =>
            sign({
              action: `Remove ${dialog.member.name} from ${company.name}`,
              details: [{ label: "Access", value: "Revoked for all accounts" }, AGREEMENT, EFFECT],
              run: () => dispatch({ type: "biz/removeMember", id: dialog.member.id }),
              toast: { title: "Member removed", description: `${dialog.member.name} no longer has access · their cards are frozen` },
            })
          }
        />
      )}

      <SmartIdModal
        open={!!signing}
        onClose={() => setSigning(null)}
        action={signing?.action ?? ""}
        details={signing?.details ?? []}
        onConfirmed={() => {
          if (!signing) return;
          signing.run();
          toast(signing.toast);
          setSigning(null);
        }}
      />
    </>
  );
}

function MemberMenu({
  member,
  you,
  canLimit,
  onOpen,
  onActivity,
}: {
  member: Member;
  you: boolean;
  canLimit: boolean;
  onOpen: (d: Dialog) => void;
  onActivity: () => void;
}) {
  return (
    <Menu
      trigger={({ toggle, open }) => (
        <Button size="sm" variant="tertiary" icon aria-label={`Actions for ${member.name}`} onClick={toggle} className={open ? "bg-subtle" : undefined}>
          <MoreHorizontal className="size-4" />
        </Button>
      )}
      items={[
        {
          label: "Change role…",
          icon: <UserCog className="size-4" />,
          disabled: you,
          hint: you ? "Not yourself" : undefined,
          onSelect: () => onOpen({ kind: "role", member }),
        },
        {
          label: "Set approval limit…",
          icon: <Wallet className="size-4" />,
          disabled: !canLimit || you,
          hint: !canLimit ? "Admins only" : undefined,
          onSelect: () => onOpen({ kind: "limit", member }),
        },
        { label: "View activity", icon: <History className="size-4" />, onSelect: onActivity },
        "separator",
        {
          label: "Remove from company…",
          icon: <Trash2 className="size-4" />,
          danger: true,
          disabled: you,
          onSelect: () => onOpen({ kind: "remove", member }),
        },
      ]}
    />
  );
}

function RoleDialog({ member, onClose, onSign }: { member: Member; onClose: () => void; onSign: (role: RoleId) => void }) {
  const [role, setRole] = useState<RoleId>(member.role);
  const diff = permissionDiff(member.role, role);
  const changed = role !== member.role;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Change role · ${member.name}`}
      description="Roles map to Swedbank rights profiles. The change amends your Digital Services Agreement — signed with Smart-ID, no branch visit."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!changed} onClick={() => onSign(role)}>
            Review & sign
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Choicebox<RoleId>
          columns={1}
          value={role}
          onChange={setRole}
          items={ROLE_ORDER.map((r) => ({
            value: r,
            title: roleMeta[r].label,
            meta: <span className="text-[12px] text-ink-4">{roleMeta[r].rights}</span>,
            description:
              r === "owner" && !member.board
                ? "Only management board members in the e-Business Register can sign agreements."
                : `${roleMeta[r].description} Can ${capabilities(r).join(", ")}.`,
            disabled: r === "owner" && !member.board,
          }))}
        />
        {changed && (
          <div className="rounded-lg bg-subtle p-3.5 text-[13px] shadow-[inset_0_0_0_1px_var(--color-line)]">
            <p className="mb-2 font-medium text-ink">What changes for {member.name.split(" ")[0]}</p>
            <ul className="flex flex-col gap-1 font-mono text-[12px]">
              {diff.gained.map((g) => (
                <li key={g} className="rounded bg-success-soft px-2 py-1 text-success">
                  + {g}
                </li>
              ))}
              {diff.lost.map((l) => (
                <li key={l} className="rounded bg-danger-soft px-2 py-1 text-danger">
                  − {l}
                </li>
              ))}
              {diff.gained.length + diff.lost.length === 0 && <li className="text-ink-3">Same permissions, different label.</li>}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}

const PRESETS = ["2000", "5000", "10000", "none", "custom"] as const;
type Preset = (typeof PRESETS)[number];

function LimitDialog({ member, onClose, onSign }: { member: Member; onClose: () => void; onSign: (limit: number | null) => void }) {
  const initial: Preset =
    member.approvalLimit === null ? "none" : (PRESETS as readonly string[]).includes(String(member.approvalLimit)) ? (String(member.approvalLimit) as Preset) : "custom";
  const [preset, setPreset] = useState<Preset>(initial);
  const [custom, setCustom] = useState(member.approvalLimit && initial === "custom" ? String(member.approvalLimit) : "");
  const max = companyLimits.selfServiceMax.daily;

  const value = preset === "none" ? null : preset === "custom" ? Number(custom) : Number(preset);
  let error: string | undefined;
  if (preset === "custom") {
    if (custom.includes(".") || custom.includes(",")) error = "The limit must be without euro cents.";
    else if (!custom) error = undefined;
    else if (Number(custom) > max) error = `Above ${money(max)} is agreed with your account manager — they'll call you within an hour.`;
  }
  const valid = !error && (preset !== "custom" || (!!custom && Number(custom) > 0));
  const changed = value !== member.approvalLimit;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Approval limit · ${member.name}`}
      description="The largest payment they can approve on their own. Anything above needs a second approver."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!valid || !changed} onClick={() => onSign(value)}>
            Review & sign
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Segmented<Preset>
          value={preset}
          onChange={setPreset}
          size="sm"
          className="flex-wrap"
          items={[
            { value: "2000", label: "€2,000" },
            { value: "5000", label: "€5,000" },
            { value: "10000", label: "€10,000" },
            { value: "none", label: "No limit" },
            { value: "custom", label: "Custom" },
          ]}
        />
        {preset === "custom" && (
          <Input
            label="Custom limit"
            prefix="€"
            inputMode="numeric"
            className="tabular"
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^\d.,]/g, ""))}
            error={error}
            placeholder="7500"
            autoFocus
          />
        )}
        <Note tone="gray">
          Company limits still apply on top: {money(companyLimits.daily.max)} per day and {money(companyLimits.monthly.max)} per month. Payments over{" "}
          {money(companyLimits.secondApprovalFrom)} always need two board members.
        </Note>
      </div>
    </Modal>
  );
}

function RemoveDialog({ member, onClose, onSign }: { member: Member; onClose: () => void; onSign: () => void }) {
  const { state } = useStore();
  const [typed, setTyped] = useState("");
  const cards = state.business.cards.filter((c) => c.memberId === member.id && !c.frozen);
  const prepared = state.business.payments.filter((p) => p.createdBy === member.id && p.status === "awaiting");
  const match = typed.trim() === member.name;

  const consequences = [
    `${member.name.split(" ")[0]} loses access to ${company.name} immediately.`,
    ...cards.map((c) => `Their card ••${c.last4} will be frozen — not cancelled, so you can reassign or close it later.`),
    ...(prepared.length
      ? [`${prepared.length} payment${prepared.length > 1 ? "s" : ""} they prepared stay in the approval queue.`]
      : []),
    ...(member.board ? ["They stay a board member in the e-Business Register — this only removes bank access."] : []),
    "The change is recorded in the activity log.",
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title={`Remove ${member.name}?`}
      footer={
        <>
          <Button variant="secondary" autoFocus onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" disabled={!match} onClick={onSign}>
            Remove member
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          {consequences.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-ink-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-3" />
              {c}
            </li>
          ))}
        </ul>
        <Input
          label={
            <span>
              Type <span className="font-semibold text-ink">{member.name}</span> to confirm
            </span>
          }
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
        />
      </div>
    </Modal>
  );
}
