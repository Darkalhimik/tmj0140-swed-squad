import type { Metadata } from "next";
import { BusinessOverview } from "./overview";

export const metadata: Metadata = { title: "Business overview" };

export default function Page() {
  return <BusinessOverview />;
}
