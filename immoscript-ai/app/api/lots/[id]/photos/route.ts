import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { LotNotFoundError } from "@/lib/services/LotService";
import { ProgramForbiddenError } from "@/lib/services/ProgramService";
import {
  InvalidPhotoTypeError,
  LotPhotoService,
  PhotoTooLargeError,
  TooManyPhotosError,
} from "@/lib/services/LotPhotoService";

type Params = { id: string };

export const GET = withOrgAuth<Params>(async (_req, authContext, { id }) => {
  try {
    const photos = await LotPhotoService.list(authContext, id);
    return NextResponse.json({ photos });
  } catch (error) {
    if (error instanceof LotNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    throw error;
  }
});

export const POST = withOrgAuth<Params>(
  async (req, authContext, { id }) => {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    try {
      const photo = await LotPhotoService.create(authContext, id, arrayBuffer, file.type);
      return NextResponse.json({ photo }, { status: 201 });
    } catch (error) {
      if (error instanceof LotNotFoundError) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      if (error instanceof ProgramForbiddenError) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      if (error instanceof InvalidPhotoTypeError) {
        return NextResponse.json({ error: "invalid_type", message: "Formats acceptés : JPEG, PNG, WebP." }, { status: 400 });
      }
      if (error instanceof PhotoTooLargeError) {
        return NextResponse.json({ error: "too_large", message: "Image trop volumineuse (5 Mo max)." }, { status: 400 });
      }
      if (error instanceof TooManyPhotosError) {
        return NextResponse.json({ error: "too_many", message: "Nombre maximum de photos atteint pour ce lot." }, { status: 400 });
      }
      throw error;
    }
  },
  { minRole: "PROMOTEUR" }
);
