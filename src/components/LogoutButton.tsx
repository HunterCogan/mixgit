import { auth } from "@/lib/auth";
import { Button, Form } from "@heroui/react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default function LogoutButton() {
  async function handleLogout() {
    "use server";
    await auth.api.signOut({ headers: await headers() });
    const cookieStore = await cookies();
    cookieStore.delete("better-auth.session_token");
    cookieStore.delete("__Secure-better-auth.session_token");
    redirect("/login");
  }

  return (
    <Form action={handleLogout}>
      <Button type="submit" variant="danger">
        Log out
      </Button>
    </Form>
  );
}
