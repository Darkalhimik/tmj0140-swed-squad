import type { Metadata } from "next";
import { CompanySettings } from "./settings";

export const metadata: Metadata = { title: "Company" };

export default function Page() {
  return <CompanySettings />;
}
