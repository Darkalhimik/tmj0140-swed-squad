import type { Metadata } from "next";
import { BusinessCards } from "./cards";

export const metadata: Metadata = { title: "Cards" };

export default function Page() {
  return <BusinessCards />;
}
