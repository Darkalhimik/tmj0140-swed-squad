import type { Metadata } from "next";
import { Team } from "./team";

export const metadata: Metadata = { title: "Team & access" };

export default function Page() {
  return <Team />;
}
