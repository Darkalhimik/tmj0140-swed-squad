"use client";

import { Bot } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { relative } from "@/lib/format";
import type { AuditEvent, Member } from "@/lib/types";

const VERBS: Record<string, string> = {
  "auth.login": "signed in to",
  "payment.created": "created",
  "payment.approved": "approved",
  "payment.rejected": "rejected",
  "payment.received": "received a payment from",
  "payment.returned": "got a returned payment:",
  "member.invited": "invited",
  "member.role_changed": "changed the role of",
  "member.limit_changed": "changed the approval limit of",
  "member.removed": "removed",
  "invite.revoked": "revoked the invite for",
  "invite.resent": "resent the invite to",
  "card.frozen": "froze",
  "card.unfrozen": "unfroze",
  "card.updated": "changed settings on",
  "card.limit_changed": "changed the limit on",
  "card.issued": "issued a card to",
  "card.authorised": "authorised a card payment on",
  "rule.updated": "updated the approval rule",
  "export.created": "exported",
  "statement.downloaded": "downloaded a statement for",
  "transfer.internal": "moved money:",
  "kyc.reminder": "sent a reminder about",
};

export function describeEvent(e: AuditEvent) {
  return VERBS[e.action] ?? e.action.replace(".", " ");
}

/** Compact recent-activity list for the overview. */
export function RecentActivity({ events, members }: { events: AuditEvent[]; members: Member[] }) {
  return (
    <ul className="flex flex-col">
      {events.map((e) => {
        const actor = members.find((m) => m.id === e.actor);
        return (
          <li key={e.id}>
            <Link href="/business/activity" className="flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-subtle">
              {actor ? (
                <Avatar name={actor.name} size="sm" className="mt-0.5" />
              ) : (
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-ink-3">
                  <Bot className="size-3.5" />
                </span>
              )}
              <span className="min-w-0 flex-1 text-[13px] leading-5">
                <span className="font-medium text-ink">{actor ? actor.name.split(" ")[0] : "Swedbank"}</span>{" "}
                <span className="text-ink-3">{describeEvent(e)}</span> <span className="text-ink-2">{e.target}</span>
                {e.detail && <span className="block truncate text-[12px] text-ink-4">{e.detail}</span>}
              </span>
              <span className="shrink-0 text-[12px] text-ink-4">{relative(e.at)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
