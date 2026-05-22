import { verifySession } from "@/lib/dal";
import { auth } from "@/lib/auth";
import { Button, Form } from "@heroui/react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await verifySession();

  async function handleLogout() {
    "use server";
    await auth.api.signOut({ headers: await headers() });
    const cookieStore = await cookies();
    cookieStore.delete("better-auth.session_token");
    cookieStore.delete("__Secure-better-auth.session_token");
    redirect("/test-login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-sans">
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="text-blue-500 text-2xl">
          Test Dashboard page, if logged in.
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-blue-500">Name: {session.name}</span>
          <span className="text-blue-500">Email: {session.email}</span>
          <span className="text-blue-500">User ID: {session.userId}</span>
        </div>

        <Button variant="primary" className="w-fit">
          <Link href="/test-project">Go to Project</Link>
        </Button>

        <Form action={handleLogout}>
          <Button type="submit" variant="danger" className="w-fit">
            Log out
          </Button>
        </Form>
      </div>
    </div>
  );
}
