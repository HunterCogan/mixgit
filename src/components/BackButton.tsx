"use client";

import { Button } from "@heroui/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export function BackButton({ href }: { href: string }) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      isIconOnly
      size="md"
      onPress={() => router.push(href)}
    >
      <ArrowLeftIcon />
    </Button>
  );
}
