import type { Metadata } from "next";
import { PlanAndFees } from "./plan";

export const metadata: Metadata = { title: "Plan & fees" };

export default function Page() {
  return <PlanAndFees />;
}
