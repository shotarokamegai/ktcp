// app/api/works/route.ts
import { NextResponse } from "next/server";
import { fetchWorks, fetchWorksByCategorySlug } from "@/lib/wp";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category"); // slug

  try {
    const works = category ? await fetchWorksByCategorySlug(category) : await fetchWorks();
    return NextResponse.json({ ok: true, works });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message ?? "Failed to fetch works" },
      { status: 500 }
    );
  }
}
