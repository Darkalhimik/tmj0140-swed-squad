"use client";

import { ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Note } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { cn } from "@/lib/cn";

export type PersonalDetails = {
  email: string;
  phone: string;
  address: string;
  taxResidency: string;
  income: string;
  employer: string;
};

const LABELS: Record<keyof PersonalDetails, string> = {
  email: "Email",
  phone: "Mobile number",
  address: "Home address",
  taxResidency: "Tax residency",
  income: "Main source of income",
  employer: "Employer or business",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function changedFields(before: PersonalDetails, after: PersonalDetails) {
  return (Object.keys(LABELS) as (keyof PersonalDetails)[])
    .filter((k) => before[k].trim() !== after[k].trim())
    .map((k) => ({ key: k, label: LABELS[k], from: before[k], to: after[k].trim() }));
}

/** Edit contact, address and income details; name and ID code come from the Population Register. */
export function DetailsModal({
  open,
  onClose,
  name,
  idCode,
  current,
  onReview,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  idCode: string;
  current: PersonalDetails;
  onReview: (next: PersonalDetails) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Update your details" description="Changes take effect after you confirm them." size="md">
      {open && <DetailsForm name={name} idCode={idCode} current={current} onCancel={onClose} onReview={onReview} />}
    </Modal>
  );
}

function DetailsForm({
  name,
  idCode,
  current,
  onCancel,
  onReview,
}: {
  name: string;
  idCode: string;
  current: PersonalDetails;
  onCancel: () => void;
  onReview: (next: PersonalDetails) => void;
}) {
  const [form, setForm] = useState<PersonalDetails>(current);
  const [submitted, setSubmitted] = useState(false);
  const set = (patch: Partial<PersonalDetails>) => setForm((f) => ({ ...f, ...patch }));

  const errors = {
    email: EMAIL.test(form.email.trim()) ? undefined : "Enter a valid email address.",
    phone: /^\+?\d[\d\s]{6,14}$/.test(form.phone.trim()) ? undefined : "Enter a phone number, e.g. +372 5123 4567.",
    address: form.address.trim().length >= 6 ? undefined : "Enter your full address.",
    employer: form.income === "Salary" && form.employer.trim().length < 2 ? "Who pays your salary?" : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);
  const changes = changedFields(current, form);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        if (valid && changes.length) onReview({ ...form, email: form.email.trim(), phone: form.phone.trim(), address: form.address.trim(), employer: form.employer.trim() });
      }}
      noValidate
    >
      <div className="flex items-start gap-3 rounded-lg bg-subtle px-3.5 py-3">
        <Lock className="mt-0.5 size-4 shrink-0 text-ink-3" />
        <div className="text-[13px]">
          <p className="font-medium text-ink">
            {name} · <span className="font-mono">{idCode}</span>
          </p>
          <p className="text-ink-3">From the Population Register. To change your name, update it there — we pick it up automatically.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} error={submitted ? errors.email : undefined} />
        <Input label="Mobile number" inputMode="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} error={submitted ? errors.phone : undefined} />
      </div>
      <Input label="Home address" value={form.address} onChange={(e) => set({ address: e.target.value })} error={submitted ? errors.address : undefined} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tax residency">
          <Select value={form.taxResidency} onChange={(e) => set({ taxResidency: e.target.value })}>
            {["Estonia", "Finland", "Latvia", "Lithuania", "Ukraine", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Main source of income">
          <Select value={form.income} onChange={(e) => set({ income: e.target.value })}>
            {["Salary", "Business income", "Pension", "Investments", "Student allowance", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Input
        label="Employer or business"
        optional={form.income !== "Salary"}
        value={form.employer}
        onChange={(e) => set({ employer: e.target.value })}
        error={submitted ? errors.employer : undefined}
        hint="Why we ask: anti-money-laundering rules require us to know where money on the account comes from."
      />

      {changes.length > 0 ? (
        <div className="rounded-lg px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
          <p className="text-[12px] font-medium text-ink-3">What changes</p>
          <ul className="mt-1.5 flex flex-col gap-1 text-[13px]">
            {changes.map((c) => (
              <li key={c.key} className="flex flex-wrap items-center gap-1.5">
                <span className="text-ink-3">{c.label}:</span>
                <span className="text-ink-4 line-through">{c.from || "—"}</span>
                <ArrowRight className="size-3 text-ink-4" />
                <span className="font-medium text-ink">{c.to || "—"}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Note tone="gray">Nothing changed yet. Edit a field, or close this window if everything is correct.</Note>
      )}

      <div className={cn("-mx-6 -mb-4 flex justify-end gap-2 border-t border-line bg-canvas px-6 py-3")}>
        <Button variant="tertiary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={changes.length === 0}>
          Review and confirm
        </Button>
      </div>
    </form>
  );
}
