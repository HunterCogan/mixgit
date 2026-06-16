"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "@heroui/react";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  "invalid-user": {
    title: "Invalid user",
    description: "The user ID in the URL is not valid.",
  },
  "invalid-project": {
    title: "Invalid project",
    description: "The project ID in the URL is not valid.",
  },
  "project-not-found": {
    title: "Project not found",
    description: "This project may have been privated or deleted.",
  },
};

export default function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    const msg = ERROR_MESSAGES[error];
    toast.danger(msg?.title ?? "Something went wrong.", {
      description: msg?.description,
    });

    // Replace url to remove toast parameter.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    const newUrl = params.size ? `${pathname}?${params}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, router, pathname]);

  return null;
}
