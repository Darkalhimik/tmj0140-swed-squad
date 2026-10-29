"use client";

import { CheckCheck, MessageSquare, Paperclip, Plus, ShieldCheck, TriangleAlert, Zap } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { BeneficiaryMark, NewPaymentDrawer, PaymentDrawer, RejectModal } from "@/components/business/payments-drawers";
import { RulesPanel } from "@/components/business/payments-rules";
import { eligibleApprovers, freePaymentsUsed, statusMeta } from "@/components/business/payments-shared";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, Money } from "@/components/ui/misc";
import { StatusDot } from "@/components/ui/status-dot";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { fmtDate, fmtDateTime, iban as fmtIban, money, relative } from "@/lib/format";
import { CURRENT_MEMBER, useStore } from "@/lib/store";
import { downloadInvoice } from "@/lib/export/documents";
import type { BizPayment } from "@/lib/types";

type Tab = "approval" | "scheduled" | "history" | "rules";

export function BusinessPayments() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { payments, members } = state.business;
  const [tab, setTab] = useState<Tab>("approval");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [rejecting, setRejecting] = useState<BizPayment | null>(null);
  const [signing, setSigning] = useState<string[] | null>(null);

  const awaiting = payments.filter((p) => p.status === "awaiting");
  const approvable = awaiting.filter((p) => p.createdBy !== CURRENT_MEMBER && !p.approvals.some((a) => a.memberId === CURRENT_MEMBER));
  const scheduled = payments.filter((p) => p.status === "scheduled" || p.status === "processing");
  const history = payments.filter((p) => p.status === "sent" || p.status === "failed" || p.status === "rejected");
  const opened = payments.find((p) => p.id === openId) ?? null;
  const toSign = signing ? payments.filter((p) => signing.includes(p.id)) : [];
  const name = (id: string) => members.find((m) => m.id === id)?.name ?? "—";
  const openCreate = useCallback(() => setCreating(true), []);

  const onSigned = useCallback(() => {
    if (!signing) return;
    const list = payments.filter((p) => signing.includes(p.id));
    for (const p of list) dispatch({ type: "biz/approve", id: p.id });
    const done = list.filter((p) => p.approvals.length + 1 >= p.required);
    setSigning(null);
    setOpenId(null);
    if (list.length === 1) {
      const p = list[0]!;
      toast({
        title: "Payment approved",
        description: done.length ? `Scheduled for ${fmtDateTime(p.executeAt)}` : `Waiting for ${p.required - p.approvals.length - 1} more approval`,
      });
    } else {
      toast({ title: `${list.length} payments approved`, description: `${done.length} scheduled · ${list.length - done.length} need another approval` });
    }
  }, [signing, payments, dispatch, toast]);

  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        description="Approve, schedule and track every payment from Nordlight Studio OÜ."
        actions={
          <Button variant="primary" leading={<Plus className="size-4" />} onClick={openCreate}>
            New payment
          </Button>
        }
      />

      <Tabs<Tab>
        className="mb-6"
        value={tab}
        onChange={setTab}
        items={[
          { value: "approval", label: "Needs approval", count: awaiting.length },
          { value: "scheduled", label: "Scheduled", count: scheduled.length },
          { value: "history", label: "History" },
          { value: "rules", label: "Approval rules" },
        ]}
      />

      {tab === "approval" && (
        <div className="flex flex-col gap-4">
          {approvable.length > 1 && (
            <div className="flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">
                  You can approve {approvable.length} payments · <Money value={approvable.reduce((s, p) => s + p.amount, 0)} />
                </p>
                <p className="text-[13px] text-ink-3">One Smart-ID signature covers all of them. You&apos;ll see each one before you sign.</p>
              </div>
              <Button variant="primary" leading={<CheckCheck className="size-4" />} onClick={() => setSigning(approvable.map((p) => p.id))}>
                Approve all ({approvable.length})
              </Button>
            </div>
          )}
          {awaiting.length === 0 ? (
            <Card>
              <EmptyState
                icon={<CheckCheck className="size-5" />}
                title="You're all caught up"
                description="New payments that need your approval appear here, and you'll get a notification."
              />
            </Card>
          ) : (
            awaiting.map((p) => (
              <ApprovalCard
                key={p.id}
                payment={p}
                onOpen={() => setOpenId(p.id)}
                onApprove={() => setSigning([p.id])}
                onReject={() => setRejecting(p)}
                onAsk={() => toast({ title: "Question sent", description: `${name(p.createdBy)} will see it on ${p.id}` })}
              />
            ))
          )}
        </div>
      )}

      {tab === "scheduled" && (
        <PaymentsTable rows={scheduled} onOpen={setOpenId} empty="No scheduled payments. Approved payments with a future date show up here." />
      )}
      {tab === "history" && <PaymentsTable rows={history} onOpen={setOpenId} empty="Sent, returned and rejected payments show up here." />}
      {tab === "rules" && <RulesPanel />}

      <PaymentDrawer
        payment={opened}
        onClose={() => setOpenId(null)}
        onApprove={(p) => setSigning([p.id])}
        onReject={(p) => setRejecting(p)}
      />
      <NewPaymentDrawer open={creating} onClose={() => setCreating(false)} />
      <Suspense fallback={null}>
        <OpenFromUrl onOpen={openCreate} />
      </Suspense>
      <RejectModal
        payment={rejecting}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) => {
          const p = rejecting!;
          dispatch({ type: "biz/reject", id: p.id, reason });
          setRejecting(null);
          setOpenId(null);
          toast({ title: "Payment rejected", description: `${name(p.createdBy)} has been notified` });
        }}
      />
      <SmartIdModal
        open={!!signing}
        onClose={() => setSigning(null)}
        onConfirmed={onSigned}
        action={toSign.length > 1 ? `Approve ${toSign.length} payments` : "Approve payment"}
        details={
          toSign.length === 1
            ? [
                { label: "To", value: toSign[0]!.beneficiary },
                { label: "IBAN", value: <span className="font-mono text-[12px]">{fmtIban(toSign[0]!.iban)}</span> },
                { label: "Amount", value: money(toSign[0]!.amount) },
                { label: "Your approval", value: `${toSign[0]!.approvals.length + 1} of ${toSign[0]!.required}` },
              ]
            : [
                ...toSign.map((p) => ({ label: p.beneficiary, value: money(p.amount) })),
                { label: "Total", value: money(toSign.reduce((s, p) => s + p.amount, 0)) },
              ]
        }
      />
    </PageContainer>
  );
}

/** Opens the new-payment sheet when arriving with ?new=1 (e.g. from ⌘K), then cleans the URL. */
function OpenFromUrl({ onOpen }: { onOpen: () => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isNew = params.get("new") === "1";
  useEffect(() => {
    if (!isNew) return;
    onOpen();
    router.replace(pathname, { scroll: false });
  }, [isNew, onOpen, router, pathname]);
  return null;
}

function ApprovalCard({
  payment: p,
  onOpen,
  onApprove,
  onReject,
  onAsk,
}: {
  payment: BizPayment;
  onOpen: () => void;
  onApprove: () => void;
  onReject: () => void;
  onAsk: () => void;
}) {
  const { state } = useStore();
  const toast = useToast();
  const { members, rules } = state.business;
  const rule = rules.find((r) => r.id === p.ruleId);
  const creator = members.find((m) => m.id === p.createdBy);
  const mine = p.createdBy === CURRENT_MEMBER;
  const approvedByMe = p.approvals.some((a) => a.memberId === CURRENT_MEMBER);
  const others = eligibleApprovers(p, rules, members);
  const free = freePaymentsUsed(1);
  const left = p.required - p.approvals.length;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-ink-3">
          {creator && <Avatar name={creator.name} size="xs" />}
          <span className="truncate">
            <span className="font-medium text-ink-2">{creator?.name}</span> requested {relative(p.createdAt)}
          </span>
        </div>
        <Badge tone="gray" className="hidden sm:inline-flex">
          {rule?.name} · {p.approvals.length} of {p.required}
        </Badge>
      </div>

      <button onClick={onOpen} className="flex w-full items-start gap-3.5 px-5 pt-4 text-left">
        <BeneficiaryMark name={p.beneficiary} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-[15px] font-medium text-ink">{p.beneficiary}</p>
            <Money value={p.amount} className="text-[17px] font-semibold tracking-[-0.02em]" />
          </div>
          <p className="truncate text-[13px] text-ink-3">{p.reference}</p>
          <p className="mt-0.5 font-mono text-[12px] tracking-tight text-ink-4">{fmtIban(p.iban)}</p>
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-1.5 px-5 pt-3 pl-[74px]">
        {p.attachment && (
          <button
            onClick={async () => {
              const file = await downloadInvoice(p);
              toast({ title: "Invoice downloaded", description: file });
            }}
            className="rounded-full transition-opacity hover:opacity-80"
            title="Download invoice"
          >
            <Badge tone="gray" icon={<Paperclip className="size-3" />}>
              {p.attachment}
            </Badge>
          </button>
        )}
        {p.newBeneficiary && (
          <Badge tone="warning" icon={<TriangleAlert className="size-3" />}>
            First payment to this IBAN
          </Badge>
        )}
        <Badge tone="gray" icon={p.scheme === "SEPA Instant" ? <Zap className="size-3" /> : undefined}>
          {p.fee > 0 ? `${money(p.fee)} fee` : `No fee · ${free.used} of 1,000 free`}
        </Badge>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-line bg-canvas px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5 text-[13px] text-ink-3">
          <span className="flex -space-x-1">
            {p.approvals.map((a) => (
              <Avatar key={a.memberId} name={members.find((m) => m.id === a.memberId)?.name ?? "?"} size="xs" className="ring-2 ring-canvas" />
            ))}
            {Array.from({ length: left }).map((_, i) => (
              <span key={i} className="size-5 rounded-full bg-surface shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] ring-2 ring-canvas" />
            ))}
          </span>
          <span className="min-w-0">
            {mine
              ? `You created this — ${others.map((m) => m.name.split(" ")[0]).join(" or ")} must approve`
              : approvedByMe
                ? `You approved · waiting for ${others.map((m) => m.name.split(" ")[0]).join(" or ")}`
                : p.scheme === "SEPA Instant"
                  ? "Arrives within seconds of approval"
                  : p.scheme === "SEPA"
                    ? "Arrives the next business day after approval"
                    : "Arrives in 1–3 business days after approval"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="tertiary" icon aria-label="Ask a question" onClick={onAsk}>
            <MessageSquare className="size-4" />
          </Button>
          {!mine && !approvedByMe && (
            <>
              <Button size="sm" variant="secondary" onClick={onReject}>
                Reject
              </Button>
              <Button size="sm" variant="primary" leading={<ShieldCheck className="size-3.5" />} onClick={onApprove}>
                Approve
              </Button>
            </>
          )}
          {(mine || approvedByMe) && (
            <Button size="sm" variant="secondary" onClick={onOpen}>
              View
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function PaymentsTable({ rows, onOpen, empty }: { rows: BizPayment[]; onOpen: (id: string) => void; empty: string }) {
  const { state } = useStore();
  const members = state.business.members;
  if (rows.length === 0)
    return (
      <Card>
        <EmptyState title="Nothing here yet" description={empty} />
      </Card>
    );
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[12px] text-ink-3">
            <th className="px-5 py-2.5 font-medium">Payment</th>
            <th className="hidden px-3 py-2.5 font-medium md:table-cell">ID</th>
            <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Status</th>
            <th className="hidden px-3 py-2.5 font-medium lg:table-cell">Created by</th>
            <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Date</th>
            <th className="px-5 py-2.5 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const creator = members.find((m) => m.id === p.createdBy);
            return (
              <tr key={p.id} onClick={() => onOpen(p.id)} className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-subtle">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <BeneficiaryMark name={p.beneficiary} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{p.beneficiary}</p>
                      <p className="max-w-[260px] truncate text-[12px] text-ink-3">
                        <span className="sm:hidden">{statusMeta[p.status].label} · </span>
                        {p.reference}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-3 font-mono text-[12px] text-ink-3 md:table-cell">{p.id}</td>
                <td className="hidden px-3 py-3 sm:table-cell">
                  <StatusDot status={statusMeta[p.status].dot} label={statusMeta[p.status].label} />
                </td>
                <td className="hidden px-3 py-3 lg:table-cell">
                  <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
                    {creator && <Avatar name={creator.name} size="xs" />}
                    {creator?.name.split(" ")[0]}
                  </span>
                </td>
                <td className="tabular hidden px-3 py-3 text-[13px] text-ink-2 sm:table-cell">{fmtDate(p.executeAt)}</td>
                <td className={cn("px-5 py-3 text-right", p.status === "rejected" && "text-ink-4 line-through")}>
                  <Money value={p.amount} className="font-medium" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
