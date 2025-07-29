import { getImagesForUser } from "@/app/actions/image/getImagesForUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const noCache = url.searchParams.get("noCache") === "true";

  const res = await getImagesForUser({ noCache });
  if (res.error) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }
  return NextResponse.json({ images: res.images });
}
