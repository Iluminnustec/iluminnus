import { NextResponse } from "next/server";
import { APP_VERSION, APP_UPDATED_AT } from "@/lib/version";

export async function GET() {
  return NextResponse.json({ version: APP_VERSION, updatedAt: APP_UPDATED_AT });
}
