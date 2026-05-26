import Link from "next/link";
import { verifySession } from "@/lib/dal";
import UserMenu from "./UserMenu";
import User from "@/models/User";

export default async function Header() {
  const { name, userId } = await verifySession();

  const user = await User.findById(userId).lean();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-6 border-b border-nav-border bg-nav-surface z-30">
      <Link href="/dashboard" className="text-3xl font-bold">
        Scratchpad
      </Link>
      <UserMenu name={name} color={user?.color} />
    </header>
  );
}
