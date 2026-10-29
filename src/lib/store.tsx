"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import {
  approvalRules,
  auditLog,
  businessAccounts,
  businessCards,
  businessPayments,
  businessTxns,
  invites as seedInvites,
  members as seedMembers,
} from "@/lib/data/business";
import { personalAccounts, personalCards, personalTxns } from "@/lib/data/personal";
import { NOW } from "@/lib/format";
import type { Account, ApprovalRule, AuditEvent, BizPayment, Card, Invite, Member, RoleId, Txn } from "@/lib/types";

export const CURRENT_MEMBER = "m-mari";
const NOW_ISO = NOW.toISOString();

export type Founder = {
  id: string;
  name: string;
  idCode: string;
  email: string;
  residency: "Estonian resident" | "e-Resident";
  share: number;
  board: boolean;
  you?: boolean;
};

export type Formation = {
  mode: "new" | "existing" | null;
  step: number;
  name: string;
  founders: Founder[];
  emtak: { code: string; label: string } | null;
  description: string;
  turnover: string;
  countries: string[];
  cash: boolean;
  capital: number;
  address: "own" | "service";
  addressLine: string;
  plan: string;
  existingCode: string;
  submittedAt: string | null;
  representation: "alone" | "joint";
  payFromAccount: boolean;
  vat: boolean;
  employees: boolean;
  cards: boolean;
  coFounderRole: RoleId;
  approvalPreset: "single" | "second" | "always";
  accounting: "merit" | "smartaccounts" | "directo" | "later";
  signed: string[];
  furthest: number;
};

const initialFormation: Formation = {
  mode: null,
  step: 0,
  name: "",
  founders: [
    {
      id: "f-1",
      name: "Mari Tamm",
      idCode: "49203150123",
      email: "mari.tamm@gmail.com",
      residency: "Estonian resident",
      share: 60,
      board: true,
      you: true,
    },
    {
      id: "f-2",
      name: "Karl Põder",
      idCode: "38811040215",
      email: "karl.poder@gmail.com",
      residency: "Estonian resident",
      share: 40,
      board: true,
    },
  ],
  emtak: null,
  description: "",
  turnover: "",
  countries: ["Estonia"],
  cash: false,
  capital: 2500,
  address: "own",
  addressLine: "Kalasadama 4-12, 10415 Tallinn",
  plan: "",
  existingCode: "",
  submittedAt: null,
  representation: "alone",
  payFromAccount: true,
  vat: false,
  employees: false,
  cards: true,
  coFounderRole: "admin",
  approvalPreset: "second",
  accounting: "merit",
  signed: [],
  furthest: 0,
};

type State = {
  seq: number;
  personal: { accounts: Account[]; txns: Txn[]; cards: Card[] };
  business: {
    accounts: Account[];
    txns: Txn[];
    cards: Card[];
    payments: BizPayment[];
    members: Member[];
    invites: Invite[];
    rules: ApprovalRule[];
    audit: AuditEvent[];
  };
  formation: Formation;
};

const initialState: State = {
  seq: 100,
  personal: { accounts: personalAccounts, txns: personalTxns, cards: personalCards },
  business: {
    accounts: businessAccounts,
    txns: businessTxns,
    cards: businessCards,
    payments: businessPayments,
    members: seedMembers,
    invites: seedInvites,
    rules: approvalRules,
    audit: auditLog,
  },
  formation: initialFormation,
};

type Action =
  | { type: "personal/card"; id: string; patch: Partial<Card> }
  | { type: "personal/cardSetting"; id: string; key: keyof Card["settings"]; value: boolean }
  | { type: "personal/cardLimit"; id: string; index: number; max: number }
  | { type: "personal/addCard"; name: string; limit: number }
  | { type: "personal/pay"; to: string; iban: string; amount: number; reference: string; instant: boolean }
  | {
      type: "personal/payCard";
      to: string;
      amount: number;
      fee: number;
      message: string;
      card: NonNullable<Txn["toCard"]>;
      fx?: Txn["fx"];
      instant: boolean;
    }
  | { type: "move"; scope: "personal" | "business"; from: string; to: string; amount: number }
  | { type: "biz/approve"; id: string }
  | { type: "biz/reject"; id: string; reason: string }
  | { type: "biz/createPayment"; payment: Omit<BizPayment, "id" | "createdAt" | "createdBy" | "approvals" | "status"> }
  | { type: "biz/invite"; emails: string[]; role: RoleId }
  | { type: "biz/revokeInvite"; id: string }
  | { type: "biz/resendInvite"; id: string }
  | { type: "biz/memberRole"; id: string; role: RoleId }
  | { type: "biz/memberLimit"; id: string; limit: number | null }
  | { type: "biz/removeMember"; id: string }
  | { type: "biz/card"; id: string; patch: Partial<Card>; reason?: string }
  | { type: "biz/cardLimit"; id: string; max: number }
  | { type: "biz/issueCard"; memberId: string | null; name: string; limit: number }
  | { type: "biz/rule"; id: string; patch: Partial<ApprovalRule> }
  | { type: "biz/log"; action: string; target: string; detail?: string }
  | { type: "formation/set"; patch: Partial<Formation> }
  | { type: "formation/reset" };

function audit(state: State, action: string, target: string, detail?: string, actor = CURRENT_MEMBER): AuditEvent {
  return { id: `a-${state.seq}`, at: NOW_ISO, actor, action, target, detail, ip: "84.50.112.7", device: "Chrome · macOS" };
}

function memberName(state: State, id: string) {
  return state.business.members.find((m) => m.id === id)?.name ?? id;
}

function money(n: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);
}

function withAudit(state: State, business: Partial<State["business"]>, event: AuditEvent): State {
  return {
    ...state,
    seq: state.seq + 1,
    business: { ...state.business, ...business, audit: [event, ...state.business.audit] },
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "personal/card":
      return {
        ...state,
        personal: {
          ...state.personal,
          cards: state.personal.cards.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
        },
      };
    case "personal/cardSetting":
      return {
        ...state,
        personal: {
          ...state.personal,
          cards: state.personal.cards.map((c) =>
            c.id === action.id ? { ...c, settings: { ...c.settings, [action.key]: action.value } } : c,
          ),
        },
      };
    case "personal/cardLimit":
      return {
        ...state,
        personal: {
          ...state.personal,
          cards: state.personal.cards.map((c) =>
            c.id === action.id
              ? { ...c, limits: c.limits.map((l, i) => (i === action.index ? { ...l, max: action.max } : l)) }
              : c,
          ),
        },
      };
    case "personal/addCard": {
      const card: Card = {
        id: `pc-${state.seq}`,
        name: action.name,
        holder: "MARI TAMM",
        last4: String(3000 + ((state.seq * 7919) % 6999)).slice(-4),
        kind: "virtual",
        network: "Visa",
        design: "cream",
        expiry: "10/28",
        frozen: false,
        limits: [{ label: "Online payments", used: 0, max: action.limit, period: "month" }],
        settings: { online: true, contactless: false, abroad: true, atm: false },
      };
      return { ...state, seq: state.seq + 1, personal: { ...state.personal, cards: [...state.personal.cards, card] } };
    }
    case "personal/pay": {
      const txn: Txn = {
        id: `pt-${state.seq}`,
        accountId: "p-main",
        at: NOW_ISO,
        counterparty: action.to,
        amount: -action.amount,
        category: "transfers",
        method: action.instant ? "instant" : "sepa",
        status: action.instant ? "booked" : "pending",
        iban: action.iban,
        reference: action.reference,
        fee: 0,
      };
      return {
        ...state,
        seq: state.seq + 1,
        personal: {
          ...state.personal,
          txns: [txn, ...state.personal.txns],
          accounts: state.personal.accounts.map((a) =>
            a.id === "p-main" ? { ...a, balance: Math.round((a.balance - action.amount) * 100) / 100 } : a,
          ),
        },
      };
    }
    case "personal/payCard": {
      const transfer: Txn = {
        id: `pt-${state.seq}`,
        accountId: "p-main",
        at: NOW_ISO,
        counterparty: action.to,
        amount: -action.amount,
        category: "transfers",
        method: "tocard",
        status: action.instant ? "booked" : "pending",
        reference: action.message || undefined,
        fee: action.fee,
        toCard: action.card,
        fx: action.fx,
      };
      const feeTxn: Txn[] =
        action.fee > 0
          ? [
              {
                id: `pt-${state.seq}-fee`,
                accountId: "p-main",
                at: NOW_ISO,
                counterparty: "Swedbank",
                amount: -action.fee,
                category: "fees",
                method: "fee",
                status: "booked",
                reference: `Card transfer fee · ${action.card.network} ••${action.card.last4}`,
              },
            ]
          : [];
      const total = action.amount + action.fee;
      return {
        ...state,
        seq: state.seq + 1,
        personal: {
          ...state.personal,
          txns: [...feeTxn, transfer, ...state.personal.txns],
          accounts: state.personal.accounts.map((a) =>
            a.id === "p-main" ? { ...a, balance: Math.round((a.balance - total) * 100) / 100 } : a,
          ),
        },
      };
    }
    case "move": {
      const book = state[action.scope];
      const from = book.accounts.find((a) => a.id === action.from);
      const to = book.accounts.find((a) => a.id === action.to);
      if (!from || !to) return state;
      const round = (n: number) => Math.round(n * 100) / 100;
      const accounts = book.accounts.map((a) =>
        a.id === from.id ? { ...a, balance: round(a.balance - action.amount) } : a.id === to.id ? { ...a, balance: round(a.balance + action.amount) } : a,
      );
      const txn: Txn = {
        id: `mv-${state.seq}`,
        accountId: from.id,
        at: NOW_ISO,
        counterparty: to.name,
        amount: -action.amount,
        category: "savings",
        method: "internal",
        status: "booked",
        reference: `Moved from ${from.name}`,
      };
      const next = { ...book, accounts, txns: from.id.endsWith("main") ? [txn, ...book.txns] : book.txns };
      if (action.scope === "personal") return { ...state, seq: state.seq + 1, personal: next as State["personal"] };
      return withAudit(state, next, audit(state, "transfer.internal", `${from.name} → ${to.name}`, money(action.amount)));
    }
    case "biz/approve": {
      const p = state.business.payments.find((x) => x.id === action.id);
      if (!p || p.approvals.some((a) => a.memberId === CURRENT_MEMBER)) return state;
      const approvals = [...p.approvals, { memberId: CURRENT_MEMBER, at: NOW_ISO }];
      const done = approvals.length >= p.required;
      const next: BizPayment = { ...p, approvals, status: done ? "scheduled" : "awaiting" };
      return withAudit(
        state,
        { payments: state.business.payments.map((x) => (x.id === p.id ? next : x)) },
        audit(
          state,
          "payment.approved",
          `${p.id} · ${p.beneficiary}`,
          `${approvals.length} of ${p.required} approvals${done ? " · scheduled" : ""}`,
        ),
      );
    }
    case "biz/reject": {
      const p = state.business.payments.find((x) => x.id === action.id);
      if (!p) return state;
      const next: BizPayment = {
        ...p,
        status: "rejected",
        rejectedBy: { memberId: CURRENT_MEMBER, at: NOW_ISO, reason: action.reason },
      };
      return withAudit(
        state,
        { payments: state.business.payments.map((x) => (x.id === p.id ? next : x)) },
        audit(state, "payment.rejected", `${p.id} · ${p.beneficiary}`, action.reason || "No reason given"),
      );
    }
    case "biz/createPayment": {
      const id = `PAY-${2043 + state.business.payments.filter((p) => Number(p.id.slice(4)) >= 2043).length}`;
      const p: BizPayment = {
        ...action.payment,
        id,
        createdAt: NOW_ISO,
        createdBy: CURRENT_MEMBER,
        approvals: [],
        status: "awaiting",
      };
      return withAudit(
        state,
        { payments: [p, ...state.business.payments] },
        audit(state, "payment.created", `${id} · ${p.beneficiary}`, money(p.amount)),
      );
    }
    case "biz/invite": {
      const created: Invite[] = action.emails.map((email, i) => ({
        id: `inv-${state.seq}-${i}`,
        email,
        role: action.role,
        invitedBy: CURRENT_MEMBER,
        at: NOW_ISO,
        expiresAt: new Date(NOW.getTime() + 7 * 86_400_000).toISOString(),
      }));
      return withAudit(
        state,
        { invites: [...created, ...state.business.invites] },
        audit(state, "member.invited", action.emails.join(", "), `Role: ${action.role[0]!.toUpperCase()}${action.role.slice(1)}`),
      );
    }
    case "biz/revokeInvite": {
      const inv = state.business.invites.find((i) => i.id === action.id);
      if (!inv) return state;
      return withAudit(
        state,
        { invites: state.business.invites.filter((i) => i.id !== action.id) },
        audit(state, "invite.revoked", inv.email),
      );
    }
    case "biz/resendInvite": {
      const inv = state.business.invites.find((i) => i.id === action.id);
      if (!inv) return state;
      return withAudit(
        state,
        {
          invites: state.business.invites.map((i) =>
            i.id === action.id ? { ...i, at: NOW_ISO, expiresAt: new Date(NOW.getTime() + 7 * 86_400_000).toISOString() } : i,
          ),
        },
        audit(state, "invite.resent", inv.email, "Expires in 7 days"),
      );
    }
    case "biz/memberRole": {
      const m = state.business.members.find((x) => x.id === action.id);
      if (!m) return state;
      return withAudit(
        state,
        { members: state.business.members.map((x) => (x.id === action.id ? { ...x, role: action.role } : x)) },
        audit(state, "member.role_changed", m.name, `${m.role} → ${action.role}`),
      );
    }
    case "biz/memberLimit": {
      const m = state.business.members.find((x) => x.id === action.id);
      if (!m) return state;
      const fmt = (v: number | null) => (v === null ? "No limit" : money(v));
      return withAudit(
        state,
        { members: state.business.members.map((x) => (x.id === action.id ? { ...x, approvalLimit: action.limit } : x)) },
        audit(state, "member.limit_changed", m.name, `Approval limit ${fmt(m.approvalLimit)} → ${fmt(action.limit)}`),
      );
    }
    case "biz/removeMember": {
      const m = state.business.members.find((x) => x.id === action.id);
      if (!m) return state;
      return withAudit(
        state,
        {
          members: state.business.members.filter((x) => x.id !== action.id),
          cards: state.business.cards.map((c) => (c.memberId === action.id ? { ...c, frozen: true } : c)),
        },
        audit(state, "member.removed", m.name, "Access revoked · their cards were frozen"),
      );
    }
    case "biz/card": {
      const c = state.business.cards.find((x) => x.id === action.id);
      if (!c) return state;
      const label = `${c.memberId ? memberName(state, c.memberId) : c.name} ••${c.last4}`;
      const verb = action.patch.frozen === undefined ? "card.updated" : action.patch.frozen ? "card.frozen" : "card.unfrozen";
      return withAudit(
        state,
        { cards: state.business.cards.map((x) => (x.id === action.id ? { ...x, ...action.patch } : x)) },
        audit(state, verb, label, action.reason),
      );
    }
    case "biz/cardLimit": {
      const c = state.business.cards.find((x) => x.id === action.id);
      if (!c) return state;
      const label = `${c.memberId ? memberName(state, c.memberId) : c.name} ••${c.last4}`;
      return withAudit(
        state,
        {
          cards: state.business.cards.map((x) =>
            x.id === action.id ? { ...x, limits: x.limits.map((l, i) => (i === 0 ? { ...l, max: action.max } : l)) } : x,
          ),
        },
        audit(state, "card.limit_changed", label, `Monthly limit ${money(c.limits[0]!.max)} → ${money(action.max)}`),
      );
    }
    case "biz/issueCard": {
      const m = action.memberId ? state.business.members.find((x) => x.id === action.memberId) : null;
      const card: Card = {
        id: `bc-${state.seq}`,
        name: action.name,
        holder: m ? m.name.toUpperCase() : "NORDLIGHT STUDIO",
        memberId: m?.id,
        last4: String(1000 + ((state.seq * 7919) % 8999)).slice(-4),
        kind: m ? "debit" : "virtual",
        network: "Visa",
        design: m ? "orange" : "graphite",
        expiry: "10/29",
        frozen: false,
        limits: [{ label: "Monthly spend", used: 0, max: action.limit, period: "month" }],
        settings: { online: true, contactless: !!m, abroad: false, atm: false },
      };
      return withAudit(
        state,
        { cards: [...state.business.cards, card] },
        audit(state, "card.issued", `${m ? m.name : action.name} ••${card.last4}`, `${m ? "Virtual + physical" : "Virtual"} · limit ${money(action.limit)}/month`),
      );
    }
    case "biz/rule": {
      const r = state.business.rules.find((x) => x.id === action.id);
      if (!r) return state;
      return withAudit(
        state,
        { rules: state.business.rules.map((x) => (x.id === action.id ? { ...x, ...action.patch } : x)) },
        audit(state, "rule.updated", r.name, Object.entries(action.patch).map(([k, v]) => `${k}: ${v}`).join(", ")),
      );
    }
    case "biz/log":
      return withAudit(state, {}, audit(state, action.action, action.target, action.detail));
    case "formation/set":
      return { ...state, formation: { ...state.formation, ...action.patch } };
    case "formation/reset":
      return { ...state, formation: initialFormation };
  }
}

type Store = { state: State; dispatch: (a: Action) => void };

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export function useMember(id: string | undefined) {
  const { state } = useStore();
  return state.business.members.find((m) => m.id === id);
}
