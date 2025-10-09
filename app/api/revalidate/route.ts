import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let slug: string | undefined;
  try {
    const body = await req.json();
    slug = body?.slug;
  } catch {}

  revalidatePath("/works");
  if (slug) revalidatePath(`/works/${slug}`);

  return NextResponse.json({ ok: true, slug: slug ?? null, ts: Date.now() });
}
