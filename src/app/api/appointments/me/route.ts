import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserAppointments } from "@/lib/actions/appointments";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ appointments: [] }, { status: 401 });
  }

  const appointments = await getUserAppointments(user.id);
  return NextResponse.json({ appointments });
}
