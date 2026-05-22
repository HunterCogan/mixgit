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

  // !!! change to /login once that page is made
  if (!session?.user?.id) {
    redirect("/test-login");
  }

  return {
    isAuth: true as const,
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
});
