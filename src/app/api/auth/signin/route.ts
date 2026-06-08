import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, buildAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email });
    const cookie = buildAuthCookie(token);

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
