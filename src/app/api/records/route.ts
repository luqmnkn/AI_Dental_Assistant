import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getMedicalRecords } from "@/lib/actions/records";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ records: [] }, { status: 401 });
  }

  try {
    const records = await getMedicalRecords(user.id);
    return NextResponse.json({ records });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
