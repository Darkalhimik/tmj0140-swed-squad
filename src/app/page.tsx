import type { Metadata } from "next";
import { SignIn } from "./sign-in";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return <SignIn />;
}
