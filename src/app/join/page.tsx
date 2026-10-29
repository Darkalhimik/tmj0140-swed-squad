import type { Metadata } from "next";
import { Join } from "./join";

export const metadata: Metadata = { title: "Become a customer" };

export default function Page() {
  return <Join />;
}
