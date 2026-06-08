"use server";

import { prisma } from "../prisma";

type UserPayload = { id?: string; email?: string; name?: string };

export async function syncUser(payload?: UserPayload) {
  try {
    if (!payload || !payload.email) return;

    const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser server action", error);
  }
}
