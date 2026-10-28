import type { Metadata } from "next";
import { BusinessPayments } from "./payments";

export const metadata: Metadata = { title: "Payments" };

export default function Page() {
  return <BusinessPayments />;
}
