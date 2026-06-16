"use client";

import { Avatar, Dropdown } from "@heroui/react";
import { logout } from "@/lib/actions/auth";

export default function UserMenu({
  name,
  color,
  imagePath,
  userId,
}: {
  name: string;
  color: string | undefined;
  imagePath: string | undefined;
  userId: string;
}) {
  const initial = name.substring(0, 2).toUpperCase();
  const imageUrl = imagePath
    ? `https://scratchpad-profile-images.s3.us-east-1.amazonaws.com/${imagePath}`
    : undefined;

  return (
    <div className="relative">
      <Dropdown>
        <Dropdown.Trigger>
          <Avatar className="cursor-pointer">
            <Avatar.Image src={imageUrl} alt={name} />
            <Avatar.Fallback style={{ backgroundColor: color }}>
              {initial}
            </Avatar.Fallback>
          </Avatar>
        </Dropdown.Trigger>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu>
            <Dropdown.Item href={`/users/${userId}`}>My profile</Dropdown.Item>
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
