import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { Header as HeroHeader } from "@heroui/react";
import UserMenu from "./UserMenu";
import GlobalSearch from "./GlobalSearch";
import User from "@/models/User";
import { NavToggleButton } from "./NavToggleButton";

export default async function Header() {
  const { name, userId } = await verifySession();
  const user = await User.findById(userId).lean();
  const displayName = user?.name ?? name;

  return (
    <HeroHeader className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-3 sm:px-6 py-0 border-b border-nav-border bg-nav-surface z-30">
      <div className="flex items-center gap-3 sm:gap-5">
        <NavToggleButton />
        <Link href="/dashboard" className="text-2xl sm:text-3xl font-bold">
          Scratchpad
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink">
        <GlobalSearch />
        <UserMenu name={displayName} color={user?.color} userId={userId} />
      </div>
    </HeroHeader>
  );
}
