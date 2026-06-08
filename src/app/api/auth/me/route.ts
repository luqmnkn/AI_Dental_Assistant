import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.split(";").map((s) => s.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!match) return NextResponse.json({ user: null });
    const token = match.split("=")[1];
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ user: null });

    const user = await prisma.user.findUnique({ where: { id: (payload as any).id } });
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
