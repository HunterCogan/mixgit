"use client";

import { Avatar, Dropdown } from "@heroui/react";
import { logout } from "@/lib/actions/auth";

export default function UserMenu({
  name,
  color,
  imagePath,
  username,
}: {
  name: string;
  color: string | undefined;
  imagePath: string | undefined;
  username: string;
}) {
  const initial = name.substring(0, 2).toUpperCase();
  const imageUrl = imagePath
    ? `/api/avatar/${username}?v=${imagePath}`
    : undefined;

  return (
    <div className="relative">
      <Dropdown>
        <Dropdown.Trigger>
          <Avatar className="cursor-pointer ring-2 ring-white">
            {imageUrl && <Avatar.Image src={imageUrl} alt={name} />}
            <Avatar.Fallback
              className="font-sans"
              style={{ backgroundColor: color }}
            >
              {initial}
            </Avatar.Fallback>
          </Avatar>
        </Dropdown.Trigger>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu>
            <Dropdown.Item href={`/${username}`}>My profile</Dropdown.Item>
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
