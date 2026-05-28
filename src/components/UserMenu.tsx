"use client";

import { Avatar, Dropdown } from "@heroui/react";
import { logout } from "@/lib/actions/auth";

export default function UserMenu({
  name,
  color,
}: {
  name: string;
  color: string | undefined;
}) {
  const initial = name.substring(0, 2).toUpperCase();

  return (
    <div className="relative">
      <Dropdown>
        <Dropdown.Trigger>
          <Avatar className="cursor-pointer">
            <Avatar.Fallback style={{ backgroundColor: color }}>
              {initial}
            </Avatar.Fallback>
          </Avatar>
        </Dropdown.Trigger>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu>
            <Dropdown.Item href="/settings">Settings</Dropdown.Item>
            <Dropdown.Item onPress={() => logout()} className="text-red-400">
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
