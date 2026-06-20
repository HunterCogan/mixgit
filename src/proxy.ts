import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/favorites",
  "/shared-projects",
  "/settings",
];

// proxy function that runs on each request to check auth state and redirects accordingly
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isAuthRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const isAuthenticated = !!session?.user?.id;

  if (!isAuthenticated) {
    return NextResponse.redirect(
      new URL("/api/auth/clear-session", request.nextUrl),
    );
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
