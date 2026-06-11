"use server";

import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  const cookieStore = await cookies();

  cookieStore.delete("better-auth.session_token");
  cookieStore.delete({
    name: "__Secure-better-auth.session_token",
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/");
}
