"use client";

import { useState } from "react";
import { NavContext } from "./NavContext";

export default function ShellLayout({
  header,
  navbar,
  children,
}: {
  header: React.ReactNode;
  navbar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <NavContext.Provider value={{ open, setOpen }}>
      {header}

      {open && (
        <>
          <aside className="flex flex-col fixed left-0 top-14 bottom-0 w-full sm:w-72 border-r border-nav-border bg-nav-surface z-30 overflow-y-auto">
            {navbar}
          </aside>

          <div
            className="fixed inset-0 top-14 bg-black/30 z-20"
            onClick={() => setOpen(false)}
          />
        </>
      )}

      <div className="mt-14">{children}</div>
    </NavContext.Provider>
  );
}
