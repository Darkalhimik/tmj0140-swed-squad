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
import { company, roleMeta } from "@/lib/data/business";
import { fmtDate, fmtDateTime, NOW, relative } from "@/lib/format";
import { useStore } from "@/lib/store";

type Tab = "members" | "invitations" | "roles";

const ACCESS_ACTIONS = new Set(["member.invited", "member.role_changed", "member.limit_changed", "member.removed", "invite.revoked"]);

export function Team() {
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
        description={`${members.length} people can access ${company.name}. Every change is signed with Smart-ID and shows up in the activity log.`}
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
          description="Invite your accountant, a co-founder or employees. They sign in with their own Smart-ID, Mobile-ID or ID-card."
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
        Links expire after 7 days. People who haven&apos;t verified their identity yet can do it remotely in a couple of minutes.
      </div>
    </div>
  );
}

function AgreementCard() {
  const { state } = useStore();
  const toast = useToast();
  const signedNow = state.business.audit.filter((e) => e.at === NOW.toISOString() && ACCESS_ACTIONS.has(e.action)).length;
  const version = 14 + signedNow;

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
            {signedNow ? "Signed just now by Mari Tamm with Smart-ID" : "Last signed 16 Oct 2026 by Mari Tamm with Smart-ID"}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="secondary"
        leading={<Download className="size-3.5" />}
        onClick={() => toast({ title: "Agreement downloaded", description: `digital-services-agreement-v${version}.asice` })}
      >
        Download (ASiC-E)
      </Button>
    </div>
  );
}
