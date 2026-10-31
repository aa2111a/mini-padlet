import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabaseAdmin";

export async function guardRequest(request: Request, scope: string, limit: number) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "???? ?? ?????." }, { status: 403 });
  }
  // Vercel overwrites x-real-ip. Local development shares a single bucket.
  const address = request.headers.get("x-real-ip") ?? "local";
  const key = createHash("sha256").update(`${scope}:${address}`).digest("hex");
  const { data, error } = await getSupabaseAdmin().rpc("consume_request", { bucket_key: key, max_attempts: limit });
  if (error) return NextResponse.json({ error: "?? ?? ??? ??? ???." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "??? ?? ????. 15? ? ?? ??? ???." }, { status: 429, headers: { "Retry-After": "900" } });
  return null;
}
