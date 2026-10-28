import type { Metadata } from "next";
import { PersonalOverview } from "./overview";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <PersonalOverview />;
}
