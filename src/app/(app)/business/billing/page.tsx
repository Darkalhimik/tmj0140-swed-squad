import type { Metadata } from "next";
import { Billing } from "./billing";

export const metadata: Metadata = { title: "Fees & usage" };

export default function Page() {
  return <Billing />;
}
