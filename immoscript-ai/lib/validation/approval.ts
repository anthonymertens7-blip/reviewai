import { z } from "zod";

export const APPROVAL_STATUSES = ["draft", "pending_review", "approved"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const updateApprovalStatusSchema = z.object({
  approvalStatus: z.enum(APPROVAL_STATUSES),
});
