import Link from "next/link";
import { verifySession } from "@/lib/dal";
import UserMenu from "./UserMenu";

export default async function Header() {
  const { name } = await verifySession();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-6 border-b border-nav-border bg-nav-surface z-30">
      <Link href="/dashboard" className="text-2xl text-slate-200 font-bold">
        Scratchpad
      </Link>
      <UserMenu name={name} />
    </header>
  );
}
