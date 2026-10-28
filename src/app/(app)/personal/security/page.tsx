import type { Metadata } from "next";
import { Security } from "./security";

export const metadata: Metadata = { title: "Privacy & security" };

export default function Page() {
  return <Security />;
}
