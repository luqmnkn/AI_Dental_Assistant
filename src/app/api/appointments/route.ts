import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { bookAppointment } from "@/lib/actions/appointments";

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { doctorId, date, time, reason } = body;

    if (!doctorId || !date || !time) {
      return NextResponse.json({ error: "Doctor, date, and time are required." }, { status: 400 });
    }

    const appointment = await bookAppointment({ doctorId, date, time, reason }, user.id);
    return NextResponse.json({ appointment });
  } catch (error: any) {
    console.error("Error in /api/appointments POST:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to book appointment." },
      { status: 500 }
    );
  }
}
