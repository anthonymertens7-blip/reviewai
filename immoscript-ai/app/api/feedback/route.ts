import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { createFeedbackSchema } from "@/lib/validation/feedback";

export const POST = withOrgAuth(async (req, authContext) => {
  const body = await req.json();
  const parsed = createFeedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const feedback = await authContext.db.feedback.create({
    data: {
      organizationId: authContext.organizationId,
      userId: authContext.userId,
      message: parsed.data.message,
      page: parsed.data.page,
    },
  });

  return NextResponse.json({ feedback }, { status: 201 });
});
