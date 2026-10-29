"use client";

import { Download, FileSignature, Mail, RotateCw, UserPlus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { InviteDrawer } from "@/components/business/team-invite";
import { MembersTable } from "@/components/business/team-members";
import { RolesMatrix } from "@/components/business/team-roles";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState, Tooltip } from "@/components/ui/misc";
import { StatusDot } from "@/components/ui/status-dot";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { roleMeta } from "@/lib/data/business";
import { agreementPdf } from "@/lib/export/pdf";
import { fmtDate, fmtDateTime, money, NOW, relative } from "@/lib/format";
import { useCompany, useStore } from "@/lib/store";

type Tab = "members" | "invitations" | "roles";

const ACCESS_ACTIONS = new Set(["member.invited", "member.role_changed", "member.limit_changed", "member.removed", "invite.revoked"]);

export function Team() {
  const company = useCompany();
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>("members");
  const [manualInvite, setManualInvite] = useState(false);
  const { members, invites } = state.business;
  const board = members.filter((m) => m.board).length;
  const external = members.filter((m) => m.external).length;

  return (
    <PageContainer>
      <PageHeader
        title="Team & access"
        description={`${members.length} ${members.length === 1 ? "person has" : "people have"} access to ${company.name}.`}
        actions={
          <Button variant="primary" leading={<UserPlus className="size-4" />} onClick={() => setManualInvite(true)}>
            Invite people
          </Button>
        }
      />

      <p className="-mt-2 mb-5 text-[13px] text-ink-3">
        {board} board members · {external} external {external === 1 ? "person" : "people"} · {invites.length} pending invitation
        {invites.length === 1 ? "" : "s"}
      </p>

      <Tabs<Tab>
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "members", label: "Members", count: members.length },
          { value: "invitations", label: "Invitations", count: invites.length },
          { value: "roles", label: "Roles & permissions" },
        ]}
      />

      {tab === "members" && (
        <div className="flex flex-col gap-4">
          <MembersTable />
          <AgreementCard />
        </div>
      )}
      {tab === "invitations" && <Invitations onInvite={() => setManualInvite(true)} />}
      {tab === "roles" && <RolesMatrix />}

      <Suspense fallback={null}>
        <InviteController manualOpen={manualInvite} onManualClose={() => setManualInvite(false)} onSent={() => setTab("invitations")} />
      </Suspense>
    </PageContainer>
  );
}

/** Opens the invite drawer from the button or from `?invite=1` (⌘K "Invite people"). */
function InviteController({ manualOpen, onManualClose, onSent }: { manualOpen: boolean; onManualClose: () => void; onSent: () => void }) {
  const params = useSearchParams();
  const fromUrl = params.get("invite") === "1";

  const close = () => {
    onManualClose();
    const url = new URL(window.location.href);
    if (url.pathname === "/business/team" && url.searchParams.has("invite")) {
      window.history.replaceState(null, "", "/business/team");
    }
  };

  return <InviteDrawer open={manualOpen || fromUrl} onClose={close} onSent={onSent} />;
}

function Invitations({ onInvite }: { onInvite: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { invites, members } = state.business;

  if (!invites.length) {
    return (
      <div className="rounded-xl bg-surface shadow-card">
        <EmptyState
          icon={<Mail className="size-5" />}
          title="No pending invitations"
          description="Everyone signs in with their own Smart-ID, Mobile-ID or ID-card."
          action={
            <Button variant="primary" leading={<UserPlus className="size-4" />} onClick={onInvite}>
              Invite people
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-card">
      <ul className="divide-y divide-line">
        {invites.map((inv) => {
          const by = members.find((m) => m.id === inv.invitedBy)?.name ?? "Someone";
          const daysLeft = Math.ceil((new Date(inv.expiresAt).getTime() - NOW.getTime()) / 86_400_000);
          return (
            <li key={inv.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-ink-3">
                  <Mail className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{inv.email}</p>
                  <p className="truncate text-[12px] text-ink-3">
                    {roleMeta[inv.role].label} · invited by {by}{" "}
                    <Tooltip content={fmtDateTime(inv.at)}>
                      <span>{relative(inv.at)}</span>
                    </Tooltip>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 pl-11 sm:pl-0">
                <StatusDot status={daysLeft <= 2 ? "waiting" : "pending"} label={`Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} · ${fmtDate(inv.expiresAt)}`} />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    leading={<RotateCw className="size-3.5" />}
                    onClick={() => {
                      dispatch({ type: "biz/resendInvite", id: inv.id });
                      toast({ title: "Invitation resent", description: `${inv.email} · valid for 7 more days` });
                    }}
                  >
                    Resend
                  </Button>
                  <Button
                    size="sm"
                    variant="tertiary"
                    leading={<X className="size-3.5" />}
                    onClick={() => {
                      dispatch({ type: "biz/revokeInvite", id: inv.id });
                      toast({
                        title: "Invitation revoked",
                        description: `${inv.email} can no longer join`,
                        action: { label: "Undo", onClick: () => dispatch({ type: "biz/invite", emails: [inv.email], role: inv.role }) },
                      });
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-line bg-canvas px-5 py-3 text-[12px] text-ink-3">
        Links expire after 7 days.
      </div>
    </div>
  );
}

function AgreementCard() {
  const company = useCompany();
  const companyLimits = useStore().state.business.limits;
  const { state } = useStore();
  const toast = useToast();
  const signedNow = state.business.audit.filter((e) => e.at === NOW.toISOString() && ACCESS_ACTIONS.has(e.action)).length;
  // The seed company has a long agreement history; a company opened in the demo starts at version 1, signed at founding.
  const version = (company.isNew ? 1 : 14) + signedNow;
  const signedWith = company.isNew ? state.session.method : "Smart-ID";
  const lastSigned = company.isNew ? company.founded : "2026-10-16T13:00:00+03:00";

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-card sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cream text-brown">
          <FileSignature className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Digital Services Agreement · version {version}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-ink-3">
            <Avatar name="Mari Tamm" size="xs" />
            {signedNow ? `Signed just now by Mari Tamm with ${state.session.method}` : `Last signed ${fmtDate(lastSigned)} by Mari Tamm with ${signedWith}`}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="secondary"
        leading={<Download className="size-3.5" />}
        onClick={async () => {
          const filename = `digital-services-agreement-v${version}.pdf`;
          const { members, rules } = state.business;
          const eur = (n: number) => money(n).replace(".00", "");
          await agreementPdf({
            filename,
            company: company.name,
            registryCode: company.registryCode,
            version,
            signedAt: signedNow ? NOW.toISOString() : lastSigned,
            signedBy: "Mari Tamm",
            users: members.map((m) => ({
              name: m.name,
              profile: `${roleMeta[m.role].label} — ${roleMeta[m.role].rights}`,
              signing: m.board ? "Board member, represents alone" : m.role === "accountant" ? "Prepares payments" : "No signing rights",
              limit: m.approvalLimit === null ? "No limit" : m.approvalLimit === 0 ? "—" : eur(m.approvalLimit),
              auth: m.auth,
            })),
            limits: [
              ["Payments per day", eur(companyLimits.daily.max)],
              ["Payments per month", eur(companyLimits.monthly.max)],
              ["Instant payments per day", eur(companyLimits.instantDaily.max)],
              ["Instant, per payment", eur(companyLimits.instantPerPayment)],
              ["Second approval from", eur(companyLimits.secondApprovalFrom)],
              ["Sign-in allowed from", companyLimits.loginCountries.join(", ")],
            ],
            rules: rules.map((r) => ({
              name: r.name,
              range: r.max === null ? `From ${eur(r.min)}` : `${eur(r.min)} – ${eur(r.max)}`,
              approvers: `${r.approvers} · ${r.who}`,
            })),
          });
          toast({ title: "Agreement downloaded", description: filename });
        }}
      >
        Download PDF
      </Button>
    </div>
  );
}
