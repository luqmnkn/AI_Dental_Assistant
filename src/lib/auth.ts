import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-env";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "token";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function signToken(payload: object, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export async function getUserFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (!match) return null;

  const token = match.split("=")[1];
  const payload = verifyToken(token);
  if (!payload || typeof payload !== "object" || !("id" in payload)) return null;

  return prisma.user.findUnique({ where: { id: (payload as any).id } });
}

export async function getUserFromServer() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || typeof payload !== "object" || !("id" in payload)) return null;

  return prisma.user.findUnique({ where: { id: (payload as any).id } });
}

export function buildAuthCookie(token: string, maxAge = 60 * 60 * 24 * 7) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearAuthCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export { COOKIE_NAME };
