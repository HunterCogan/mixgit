import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import ShellLayout from "@/components/ShellLayout";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <ShellLayout
      header={<Header />}
      navbar={session?.user?.id ? <Navbar /> : undefined}
    >
      {children}
    </ShellLayout>
  );
}
