import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserAppointmentStats } from "@/lib/actions/appointments";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ totalAppointments: 0, completedAppointments: 0 }, { status: 401 });
  }

  const stats = await getUserAppointmentStats(user.id);
  return NextResponse.json(stats);
}
