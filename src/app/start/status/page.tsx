import type { Metadata } from "next";
import { Tracker } from "./tracker";

export const metadata: Metadata = { title: "Application status" };

export default function Page() {
  return <Tracker />;
}
