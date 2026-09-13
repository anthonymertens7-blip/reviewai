import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { LotPhotoNotFoundError, LotPhotoService } from "@/lib/services/LotPhotoService";
import { LotNotFoundError } from "@/lib/services/LotService";
import { ProgramForbiddenError } from "@/lib/services/ProgramService";

type Params = { id: string; photoId: string };

export const GET = withOrgAuth<Params>(async (_req, authContext, { id, photoId }) => {
  try {
    const photo = await LotPhotoService.getBytes(authContext, photoId);
    if (photo.lotId !== id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(photo.data), {
      headers: { "Content-Type": photo.mimeType, "Cache-Control": "private, max-age=3600" },
    });
  } catch (error) {
    if (error instanceof LotPhotoNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    throw error;
  }
});

export const DELETE = withOrgAuth<Params>(
  async (_req, authContext, { id, photoId }) => {
    try {
      const photo = await LotPhotoService.getBytes(authContext, photoId);
      if (photo.lotId !== id) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      await LotPhotoService.remove(authContext, photoId);
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof LotPhotoNotFoundError || error instanceof LotNotFoundError) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      if (error instanceof ProgramForbiddenError) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      throw error;
    }
  },
  { minRole: "PROMOTEUR" }
);
