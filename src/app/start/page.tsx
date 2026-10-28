import type { Metadata } from "next";
import { Suspense } from "react";
import { Wizard } from "./wizard";

export const metadata: Metadata = { title: "Start a company" };

export default function Page() {
  return (
    <Suspense fallback={<WizardSkeleton />}>
      <Wizard />
    </Suspense>
  );
}

function WizardSkeleton() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 lg:px-8">
      <div className="skeleton h-8 w-64 rounded-md" />
      <div className="skeleton mt-3 h-4 w-96 max-w-full rounded-md" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    </div>
  );
}
