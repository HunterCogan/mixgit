"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { useNav } from "./NavContext";

export function NavToggleButton() {
  const { open, setOpen } = useNav();
  return (
    <Button
      isIconOnly
      variant="ghost"
      onPress={() => setOpen((o) => !o)}
      aria-label={open ? "Close menu" : "Open menu"}
      className="text-nav-text-subtle hover:bg-nav-item-hover hover:text-nav-text border border-nav-border rounded-lg"
    >
      <Bars3Icon className="h-6 w-6 sm:h-6 sm:w-6" />
    </Button>
  );
}
