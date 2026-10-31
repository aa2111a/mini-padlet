import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mindlet_admin";
function signature(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  return createHmac("sha256", secret).update(payload).digest("hex");
}
export function createAdminSessionToken() {
  const payload = `${Date.now() + 8 * 60 * 60 * 1000}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload)}`;
}
export async function isAdminRequest() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || Number(parts[0]) <= Date.now()) return false;
  try {
    const expected = Buffer.from(signature(`${parts[0]}.${parts[1]}`));
    const received = Buffer.from(parts[2]);
    return expected.length === received.length && timingSafeEqual(expected, received);
  } catch { return false; }
}
