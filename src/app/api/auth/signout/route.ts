import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const cookie = clearAuthCookie();
  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}
