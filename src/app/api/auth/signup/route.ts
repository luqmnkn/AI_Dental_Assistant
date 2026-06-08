import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, buildAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const token = signToken({ id: user.id, email: user.email });
    const cookie = buildAuthCookie(token);

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201, headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    console.error("/api/auth/signup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
