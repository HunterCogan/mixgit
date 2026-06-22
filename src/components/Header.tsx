import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Header as HeroHeader, Button } from "@heroui/react";
import UserMenu from "./UserMenu";
import GlobalSearch from "./GlobalSearch";
import User from "@/models/User";
import { NavToggleButton } from "./NavToggleButton";
import Image from "next/image";

export default async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  let displayName = "";
  let username = "";
  let color: string | undefined;
  let imagePath: string | undefined;

  if (userId) {
    const user = await User.findById(userId).lean();
    displayName = user?.name ?? session?.user?.name ?? "";
    username = user?.username ?? "";
    color = user?.color;
    imagePath = user?.imagePath ?? undefined;
  }

  return (
    <HeroHeader className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-3 sm:px-6 py-0 border-b border-nav-border bg-nav-surface z-30">
      <div className="flex items-center gap-3 sm:gap-5">
        {userId && <NavToggleButton />}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/mixgit_img.png"
            alt=""
            width={60}
            height={60}
            loading="eager"
            priority
          />
          <div className="flex flex-col leading-none">
            <span className="text-[26px] sm:text-[30px] font-bold tracking-tight mb-0 pb-0 text-[#0f172a]">
              MixGit
            </span>
            <span className="text-[10px] sm:text-[12px] tracking-widest text-muted-foreground uppercase">
              Remix · Build · Share
            </span>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink">
        <GlobalSearch />
        {userId ? (
          <UserMenu
            name={displayName}
            color={color}
            imagePath={imagePath}
            username={username}
          />
        ) : (
          <Link href="/signup">
            <Button variant="primary" size="sm">
              Sign Up
            </Button>
          </Link>
        )}
      </div>
    </HeroHeader>
  );
}
