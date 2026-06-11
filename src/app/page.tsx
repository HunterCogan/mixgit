import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Home from "./Home";
import ShellLayout from "@/components/ShellLayout";
import Navbar from "@/components/Navbar";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <ShellLayout header={<Header />} navbar={<Navbar />}>
      <Home />
    </ShellLayout>
  );
}
