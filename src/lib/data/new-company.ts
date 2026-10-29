import type { BusinessData, Formation } from "@/lib/store";
import type { ApprovalRule, AuditEvent, Card, Invite, Member, Txn } from "@/lib/types";
import { roleMeta } from "./business";
import { effectivePreset, NEW_COMPANY, registryLookup, STATE_FEE, turnoverBands } from "./formation";
import type { Allowance } from "./pricing";

const YOU = "m-mari";

function rulesFor(preset: Formation["approvalPreset"]): ApprovalRule[] {
  if (preset === "single") return [{ id: "r-1", name: "All payments", min: 0, max: null, approvers: 1, who: "Any board member" }];
  if (preset === "always") return [{ id: "r-1", name: "All payments", min: 0, max: null, approvers: 2, who: "Two board members" }];
  return [
    { id: "r-1", name: "Everyday payments", min: 0, max: 10000, approvers: 1, who: "Any board member" },
    { id: "r-2", name: "Large payments", min: 10000, max: null, approvers: 2, who: "Two board members" },
  ];
}

const money = (n: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);

/**
 * Turns a finished onboarding (new OÜ or existing company) into a full
 * business profile with accounts, people, rules, cards and an activity log,
 * plus the personal-account lines it caused (state fee, share capital).
 */
export function buildCompanyFromFormation(f: Formation, now: string): { business: BusinessData; personalTxns: Txn[] } {
  const isNew = f.mode === "new";
  const lookup = registryLookup[f.existingCode];
  const name = isNew ? `${f.name.trim().replace(/\s*OÜ$/i, "") || "Põhjatuul Labs"} OÜ` : (lookup?.name ?? "Your company OÜ");
  const registryCode = isNew ? NEW_COMPANY.registryCode : f.existingCode;
  const you = f.founders.find((p) => p.you)!;
  const yourCapital = isNew && f.payFromAccount ? Math.round(((f.capital * you.share) / 100) * 100) / 100 : 0;
  const others = isNew ? f.founders.filter((p) => !p.you) : [];
  const board = isNew ? f.founders.filter((p) => p.board) : [you];
  const nextYear = new Date(new Date(now).getTime() + 365 * 86_400_000).toISOString().slice(0, 10);
  const id = `c-${registryCode}`;
  const ev = (n: number, actor: string, action: string, target: string, detail?: string): AuditEvent => ({
    id: `${id}-a${n}`,
    at: now,
    actor,
    action,
    target,
    detail,
    ip: actor === "system" ? "—" : "84.50.112.7",
    device: actor === "system" ? "Swedbank" : "Chrome · macOS",
  });

  const members: Member[] = [
    {
      id: YOU,
      name: you.name,
      email: you.email,
      role: "owner",
      title: board.some((b) => b.id === you.id) ? "Founder · Management board" : "Founder",
      board: board.some((b) => b.id === you.id),
      signing: f.representation === "joint" && board.length > 1 ? "jointly" : "alone",
      approvalLimit: null,
      auth: "Smart-ID",
      joinedAt: now,
      lastActiveAt: now,
      status: "active",
    },
  ];

  const invites: Invite[] = others
    .filter((p) => p.board)
    .map((p, i) => ({
      id: `${id}-inv-${i}`,
      email: p.email,
      role: f.coFounderRole,
      invitedBy: YOU,
      at: now,
      expiresAt: new Date(new Date(now).getTime() + 7 * 86_400_000).toISOString(),
    }));

  const cards: Card[] = f.cards
    ? [
        {
          id: `${id}-card-1`,
          name: "Visa Business",
          holder: you.name.toUpperCase(),
          memberId: YOU,
          last4: "2208",
          kind: "virtual",
          network: "Visa",
          design: "orange",
          expiry: "10/30",
          frozen: false,
          limits: [{ label: "Monthly spend", used: 0, max: 5000, period: "month" }],
          settings: { online: true, contactless: true, abroad: false, atm: false },
        },
      ]
    : [];

  const accounts = [{ id: "b-main", name: "Main account", kind: "current" as const, iban: NEW_COMPANY.iban, balance: yourCapital }];

  const txns: Txn[] = yourCapital
    ? [
        {
          id: `${id}-t1`,
          accountId: "b-main",
          at: now,
          counterparty: you.name,
          amount: yourCapital,
          category: "income",
          method: "instant",
          status: "booked",
          iban: "EE382200221020145685",
          reference: "Share capital contribution",
        },
      ]
    : [];

  const rules = rulesFor(effectivePreset(f));

  let n = 0;
  const audit: AuditEvent[] = [
    ...(yourCapital ? [ev(++n, "system", "payment.received", you.name, `${money(yourCapital)} · share capital contribution`)] : []),
    ...cards.map((c) => ev(++n, "system", "card.issued", `${you.name} ••${c.last4}`, "Virtual · free for 12 months")),
    ...invites.map((i) => ev(++n, YOU, "member.invited", i.email, `Role: ${roleMeta[i.role].label}`)),
    ev(++n, YOU, "rule.updated", "Payment approvals", rules.map((r) => `${r.name}: ${r.approvers} approval${r.approvers > 1 ? "s" : ""}`).join(" · ")),
    ev(++n, YOU, "agreement.signed", "Digital Services Agreement", "Version 1 · signed with Smart-ID"),
    ev(++n, "system", "account.opened", "Main account", NEW_COMPANY.iban),
    ...(isNew ? [ev(++n, "system", "company.registered", "e-Business Register", `Registry code ${registryCode}`)] : []),
  ];

  const allowances: Allowance[] = [
    { key: "payments", label: "Euro payments — SEPA, instant, Swedbank", used: 0, included: 1000, unit: "payment", overage: 0.38, overageText: "1,000 free per month · then €0.38 (€0.16 to Swedbank)" },
    {
      key: "cards",
      label: "Business debit cards",
      used: cards.length,
      included: 0,
      unit: "card",
      overage: 2,
      monthly: 0,
      overageText: "Free for the first 12 months · then €2.00 per card per month",
    },
    { key: "swift", label: "International payments (SWIFT, SHA)", used: 0, included: 0, unit: "payment", overage: 6, overageText: "€6.00 each · plus intermediary bank fees, shown before you send" },
    { key: "users", label: "Team members, roles & approval rules", used: members.length + invites.length, included: null, unit: "person", overage: 0, overageText: "Always free — no paid tier for controls" },
  ];

  const business: BusinessData = {
    profile: {
      id,
      name,
      short: name.replace(/ OÜ$/, ""),
      registryCode,
      vat: f.vat ? "Requested" : null,
      founded: isNew ? now.slice(0, 10) : (lookup?.registered ?? now.slice(0, 10)),
      address: isNew ? f.addressLine : (lookup?.address ?? ""),
      emtak: isNew ? (f.emtak ? `${f.emtak.code} — ${f.emtak.label}` : "—") : (lookup?.emtak ?? "—"),
      employees: 0,
      kyc: {
        lastReviewed: now.slice(0, 10),
        nextReview: nextYear,
        risk: "Standard",
        answers: [
          { label: "What the company does", value: f.description.trim() || f.emtak?.label || "—" },
          { label: "Expected turnover", value: turnoverBands.find((b) => b.value === f.turnover)?.label ?? "—" },
          { label: "Countries you trade with", value: f.countries.join(", ") || "Estonia" },
          { label: "Cash usage", value: f.cash ? "Yes" : "None" },
        ],
      },
      board: board.map((b) => b.name),
      owners: isNew ? f.founders.map((p) => ({ name: p.name, share: p.share })) : (lookup?.owners ?? []),
      representation: f.representation,
      mark: { letter: name.charAt(0).toUpperCase(), bg: "#512b2b", fg: "#ffffff" },
      isNew: true,
    },
    accounts,
    txns,
    cards,
    payments: [],
    members,
    invites,
    rules,
    audit,
    limits: {
      daily: { used: 0, max: 5000 },
      monthly: { used: 0, max: 20000 },
      instantDaily: { used: 0, max: 5000 },
      instantPerPayment: 5000,
      selfServiceMax: { daily: 50000, monthly: 100000 },
      secondApprovalFrom: rules.find((r) => r.approvers > 1)?.min || 10000,
      loginCountries: ["Estonia"],
    },
    cashflow: [{ label: "Oct", a: yourCapital, b: 0 }],
    allowances,
    feeHistory: [{ label: "Oct", value: 0 }],
    invoices: [{ id: "FEE-2026-10", period: "October 2026", amount: 0, status: "upcoming", date: "2026-11-05" }],
  };

  const personalTxns: Txn[] = isNew
    ? [
        ...(yourCapital
          ? [
              {
                id: `${id}-p2`,
                accountId: "p-main",
                at: now,
                counterparty: name,
                amount: -yourCapital,
                category: "transfers" as const,
                method: "instant" as const,
                status: "booked" as const,
                iban: NEW_COMPANY.iban,
                reference: "Share capital contribution",
              },
            ]
          : []),
        {
          id: `${id}-p1`,
          accountId: "p-main",
          at: now,
          counterparty: "Ministry of Finance (RIK)",
          amount: -STATE_FEE,
          category: "taxes",
          method: "instant",
          status: "booked",
          reference: `State fee · e-Business Register application ${NEW_COMPANY.appRef}`,
        },
      ]
    : [];

  return { business, personalTxns };
}
