import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Verifies the session against the database and returns the userId (and name + email if needed).
// Call "verifySession" in route handlers that need a confirmed auth state.
export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/");
  }

  return {
    isAuth: true as const,
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    color: session.user.color ?? undefined,
  };
});
