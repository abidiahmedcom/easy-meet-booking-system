import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const deleted = await prisma.account.deleteMany({
      where: { provider: "google" }
    });
    return NextResponse.json({ 
      success: true, 
      message: `Successfully unlinked ${deleted.count} Google accounts. You must log in again to get the fresh permissions!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
