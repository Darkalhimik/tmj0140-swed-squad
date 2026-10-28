import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/shell/page-header";
import { ActivityLog } from "./activity";

export const metadata: Metadata = { title: "Activity log" };

function ActivitySkeleton() {
  return (
    <PageContainer>
      <div className="skeleton h-9 w-48 rounded-md" />
      <div className="skeleton mt-3 h-5 w-full max-w-xl rounded-md" />
      <div className="mt-8 flex flex-col gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-14 rounded-lg" />
        ))}
      </div>
    </PageContainer>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ActivitySkeleton />}>
      <ActivityLog />
    </Suspense>
  );
}
