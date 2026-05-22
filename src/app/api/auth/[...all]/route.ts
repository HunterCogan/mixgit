import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// This route catches all requests to /api/auth/* and passes them to Better Auth
export async function POST(request: NextRequest) {
  return auth.handler(request);
}

export async function GET(request: NextRequest) {
  return auth.handler(request);
}
