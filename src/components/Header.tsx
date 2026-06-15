import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Header as HeroHeader, Button } from "@heroui/react";
import UserMenu from "./UserMenu";
import GlobalSearch from "./GlobalSearch";
import User from "@/models/User";
import { NavToggleButton } from "./NavToggleButton";

export default async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  let displayName = "";
  let color: string | undefined;
  if (userId) {
    const user = await User.findById(userId).lean();
    displayName = user?.name ?? session?.user?.name ?? "";
    color = user?.color;
  }

  return (
    <HeroHeader className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-3 sm:px-6 py-0 border-b border-nav-border bg-nav-surface z-30">
      <div className="flex items-center gap-3 sm:gap-5">
        {userId && <NavToggleButton />}
        <Link href="/dashboard" className="text-2xl sm:text-3xl font-bold">
          Scratchpad
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink">
        <GlobalSearch />
        {userId ? (
          <UserMenu name={displayName} color={color} userId={userId} />
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </HeroHeader>
  );
}
