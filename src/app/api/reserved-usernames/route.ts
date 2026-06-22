import { NextResponse } from "next/server";
import { getReservedUsernames } from "@/lib/reservedUsernames";

export async function GET() {
  return NextResponse.json({ reserved: getReservedUsernames() });
}
