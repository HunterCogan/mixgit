"use client";

import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Tooltip } from "@heroui/react";

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
    <>
      {header}

      {open ? (
        <aside className="flex flex-col fixed left-0 top-14 bottom-0 w-56 border-r border-nav-border bg-nav-surface">
          <div className="flex justify-end p-2 pb-0 shrink-0">
            <Tooltip delay={200}>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                className="text-nav-text-subtle hover:bg-nav-item-hover hover:text-nav-text"
                onPress={() => setOpen(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
              <Tooltip.Content placement="bottom">Close Menu</Tooltip.Content>
            </Tooltip>
          </div>
          <div className="flex-1 overflow-y-auto">{navbar}</div>
        </aside>
      ) : (
        <aside className="flex flex-col items-center fixed left-0 top-14 bottom-0 w-10 border-r border-nav-border bg-nav-surface z-20 pt-2">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="text-nav-text-subtle hover:bg-nav-item-hover hover:text-nav-text"
            onPress={() => setOpen(true)}
          >
            <Bars3Icon className="h-4 w-4" />
          </Button>
        </aside>
      )}

      <div className={`mt-14 ${open ? "ml-56" : "ml-10"}`}>{children}</div>
    </>
  );
}
