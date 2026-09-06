import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsageCount, FREE_LIMIT } from "@/lib/usage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ count: 0, limit: FREE_LIMIT, signedIn: false });
  }

  const count = await getUsageCount(session.user.email);
  return NextResponse.json({ count, limit: FREE_LIMIT, signedIn: true });
}
