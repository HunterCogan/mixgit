import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// !!! make sure to update these once we have the pages
const protectedRoutes = ["/test-dashboard", "/test-project"];
const publicRoutes = ["/test-login", "/test-register"];

// proxy function that runs on each request to check auth state and redirects accordingly
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const isAuthenticated = !!sessionCookie;

  // !!! change to /login once that page is made
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/test-login", request.nextUrl));
  }

  // !!! change to /dashboard once that page is made
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/test-dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
