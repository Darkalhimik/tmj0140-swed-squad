"use client";

import { Check, Lock, Minus } from "lucide-react";
import { Fragment } from "react";
import { AvatarGroup } from "@/components/ui/avatar";
import { permissions, roleMeta } from "@/lib/data/business";
import { groupBy } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ROLE_ORDER } from "./team-shared";

const GUARDRAILS = [
  "Nobody can approve a payment they created themselves.",
  "Nobody can change their own role or approval limit.",
  "Removing someone freezes their cards straight away.",
  "Payments over €10,000 always need two board members.",
];

export function RolesMatrix() {
  const { state } = useStore();
  const groups = groupBy(permissions, (p) => p.group);

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-xl bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas">
                <th className="w-[34%] px-5 py-3 text-left align-bottom text-[12px] font-medium text-ink-3">Permission</th>
                {ROLE_ORDER.map((r) => {
                  const holders = state.business.members.filter((m) => m.role === r).map((m) => m.name);
                  return (
                    <th key={r} className="px-3 py-3 text-left align-bottom font-normal">
                      <p className="text-[13px] font-semibold text-ink">{roleMeta[r].label}</p>
                      <p className="text-[11px] text-ink-3">{roleMeta[r].rights}</p>
                      <div className="mt-2 h-6">
                        {holders.length ? (
                          <AvatarGroup names={holders} size="xs" max={3} />
                        ) : (
                          <span className="text-[11px] text-ink-4">Nobody yet</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {groups.map(([group, list]) => (
                <Fragment key={group}>
                  <tr>
                    <td colSpan={ROLE_ORDER.length + 1} className="bg-subtle/60 px-5 pt-3 pb-1.5 text-[12px] font-medium text-ink-3">
                      {group}
                    </td>
                  </tr>
                  {list.map((p) => (
                    <tr key={p.key} className="border-t border-line first:border-t-0">
                      <td className="px-5 py-2.5 text-[13px] text-ink-2">{p.label}</td>
                      {ROLE_ORDER.map((r) => {
                        const v = p.roles[r];
                        return (
                          <td key={r} className="px-3 py-2.5">
                            {v === true ? (
                              <Check className="size-4 text-success" strokeWidth={2.5} aria-label="Allowed" />
                            ) : v === "limit" ? (
                              <span className="text-[12px] font-medium text-warning">Within limit</span>
                            ) : (
                              <Minus className="size-4 text-ink-4" aria-label="Not allowed" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-start gap-2 border-t border-line bg-canvas px-5 py-3 text-[12px] text-ink-3">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          Default roles are locked, so a role means the same thing in every company and in your agreement. Approval limits are set per person on the Members tab.
        </div>
      </div>

      <div className="rounded-xl bg-surface p-5 shadow-card">
        <p className="text-[15px] font-semibold tracking-[-0.01em]">Always-on safeguards</p>
        <p className="mt-0.5 text-[13px] text-ink-3">These apply to everyone, including owners, and can&apos;t be switched off.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {GUARDRAILS.map((g) => (
            <li key={g} className="flex items-start gap-2.5 rounded-lg bg-subtle px-3.5 py-3 text-[13px] text-ink-2">
              <Lock className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
              {g}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
