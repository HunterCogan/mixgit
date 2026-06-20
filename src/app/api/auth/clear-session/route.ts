import { NextResponse } from "next/server";

export function GET() {
  const response = NextResponse.redirect(
    new URL("/", process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  );
  response.cookies.delete("better-auth.session_token");
  response.cookies.delete("better-auth.dont_remember");
  response.cookies.delete("__Secure-better-auth.session_token");
  response.cookies.delete("__Secure-better-auth.dont_remember");
  return response;
}
