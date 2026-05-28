"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Project = {
  id: string;
  name: string;
};

type SharedProject = {
  id: string;
  name: string;
  creatorId: string;
};

export default function NavbarClient({
  projects,
  userId,
  sharedProjects,
}: {
  projects: Project[];
  userId: string;
  sharedProjects: SharedProject[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProjectId = searchParams.get("projectId");

  return (
    <nav className="flex flex-col p-3 h-full">
      <Link
        href="/dashboard"
        className={`px-3 py-2 mb-2 rounded-md text-sm font-medium transition-colors ${
          pathname === "/dashboard"
            ? "bg-nav-item-active text-nav-text"
            : "text-nav-text hover:bg-nav-item-hover hover:text-nav-text"
        }`}
      >
        Dashboard
      </Link>
      <Link
        href="/shared-projects"
        className={`px-3 py-2 mb-2 rounded-md text-sm font-medium transition-colors ${
          pathname === "/shared-projects"
            ? "bg-nav-item-active text-nav-text"
            : "text-nav-text hover:bg-nav-item-hover hover:text-nav-text"
        }`}
      >
        Shared Projects
      </Link>
      <Link
        href="/favorites"
        className={`px-3 py-2 mb-2 rounded-md text-sm font-medium transition-colors ${
          pathname === "/favorites"
            ? "bg-nav-item-active text-nav-text"
            : "text-nav-text hover:bg-nav-item-hover hover:text-nav-text"
        }`}
      >
        Favorites
      </Link>

      {projects.length > 0 && (
        <div className="mt-10 border-t border-nav-border pt-4">
          <p className="px-3 mb-1 text-xs font-semibold text-nav-text-subtle uppercase tracking-wider">
            Recent Projects
          </p>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${userId}?projectId=${p.id}`}
              className={`block px-3 py-1.5 rounded-md text-sm truncate transition-colors ${
                pathname === `/projects/${userId}` && activeProjectId === p.id
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
              href={`/projects/${p.creatorId}?projectId=${p.id}`}
              className={`block px-3 py-1.5 rounded-md text-sm truncate transition-colors ${
                pathname === `/projects/${p.creatorId}` &&
                activeProjectId === p.id
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
