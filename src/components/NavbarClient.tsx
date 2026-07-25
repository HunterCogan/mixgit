"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Project = {
  id: string;
  name: string;
  slug: string;
};

type SharedProject = {
  id: string;
  name: string;
  creatorId: string;
  creatorUsername: string;
  slug: string;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  progress: number;
  completed: boolean;
  unlockedAt?: string;
  points: number;
};

export default function NavbarClient({
  projects,
  username,
  sharedProjects,
  achievements,
}: {
  projects: Project[];
  username: string;
  sharedProjects: SharedProject[];
  achievements: Achievement[];
}) {
  const pathname = usePathname();

  const completedCount = achievements.filter((a) => a.completed).length;
  const totalCount = achievements.length;

  return (
    <nav className="flex flex-col p-3 h-full">
      <Link
        href="/dashboard"
        className={`px-2 py-2 mb-2 rounded-md text-sm font-medium transition-colors ${
          pathname === "/dashboard"
            ? "bg-nav-item-active text-nav-text"
            : "text-nav-text hover:bg-nav-item-hover hover:text-nav-text"
        }`}
      >
        Dashboard
      </Link>
      <Link
        href="/shared-projects"
        className={`px-2 py-2 mb-2 rounded-md text-sm font-medium transition-colors ${
          pathname === "/shared-projects"
            ? "bg-nav-item-active text-nav-text"
            : "text-nav-text hover:bg-nav-item-hover hover:text-nav-text"
        }`}
      >
        Shared Projects
      </Link>
      <Link
        href="/achievements"
        className={`flex items-center justify-between px-2 py-2 mb-4 rounded-md text-sm font-medium transition-colors ${
          pathname === "/achievements"
            ? "bg-nav-item-active text-nav-text"
            : "text-nav-text hover:bg-nav-item-hover hover:text-nav-text"
        }`}
      >
        Achievements
        {totalCount > 0 && (
          <span className="text-xs font-semibold text-nav-text-subtle">
            {completedCount}/{totalCount}
          </span>
        )}
      </Link>

      {projects.length > 0 && (
        <div className="border-t border-nav-border pt-4">
          <p className="px-3 mb-1 text-xs font-semibold text-nav-text-subtle uppercase tracking-wider">
            Recent Projects
          </p>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/${username}/${p.slug}`}
              className={`block px-3 py-1.5 rounded-md text-sm truncate transition-colors ${
                pathname === `/${username}/${p.slug}`
                  ? "bg-nav-item-active text-nav-text"
                  : "text-nav-text hover:bg-nav-item-hover hover:text-nav-text"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}

      {sharedProjects.length > 0 && (
        <div className="mt-4 border-t border-nav-border pt-4">
          <p className="px-3 mb-1 text-xs font-semibold text-nav-text-subtle uppercase tracking-wider">
            Shared Projects
          </p>
          {sharedProjects.map((p) => (
            <Link
              key={p.id}
              href={`/${p.creatorUsername}/${p.slug}`}
              className={`block px-3 py-1.5 rounded-md text-sm truncate transition-colors ${
                pathname === `/${p.creatorUsername}/${p.slug}`
                  ? "bg-nav-item-active text-nav-text"
                  : "text-nav-text hover:bg-nav-item-hover hover:text-nav-text"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}
      <div className="flex-1" />
    </nav>
  );
}
