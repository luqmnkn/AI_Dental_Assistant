import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getHabitLogs, toggleHabit } from "@/lib/actions/records";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ logs: [] }, { status: 401 });
  }

  try {
    const logs = await getHabitLogs(user.id);
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { habit, date } = await req.json();
    if (!habit || !date) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const updatedLog = await toggleHabit(habit, date, user.id);
    return NextResponse.json({ log: updatedLog });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
