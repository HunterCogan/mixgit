import { NextResponse } from "next/server";

export function GET() {
  const response = NextResponse.redirect(
    new URL("/", process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  );
  const base = { httpOnly: true, sameSite: "lax" as const, path: "/" }; // base used for creating cookies in src/lib/auth.ts
  response.cookies.delete({ name: "better-auth.session_token", ...base });
  response.cookies.delete({ name: "better-auth.dont_remember", ...base });
  response.cookies.delete({
    name: "__Secure-better-auth.session_token",
    ...base,
    secure: true,
  });
  response.cookies.delete({
    name: "__Secure-better-auth.dont_remember",
    ...base,
    secure: true,
  });
  return response;
}
