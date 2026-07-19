const COOKIE_NAME = "luan_admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export type AdminRole = "admin" | "catalog_manager" | "seller" | "finance_manager" | "collections";
export type AdminSessionData = { userId: string | null; role: AdminRole; expiresAt: number };
const roles: AdminRole[] = ["admin", "catalog_manager", "seller", "finance_manager", "collections"];

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

async function sign(value: string) {
  const secret = getSecret();
  if (!secret) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return Buffer.from(signature).toString("base64url");
}

export async function createAdminSessionValue(identity?: { userId: string; role: AdminRole }) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = identity ? `${expiresAt}.${identity.userId}.${identity.role}` : String(expiresAt);
  return `${payload}.${await sign(payload)}`;
}

export async function parseAdminSession(value?: string): Promise<AdminSessionData | null> {
  if (!value || !getSecret()) return null;
  const parts = value.split(".");
  const legacy = parts.length === 2;
  if (!legacy && parts.length !== 4) return null;
  const expiresAt = parts[0];
  const userId = legacy ? null : parts[1];
  const role = (legacy ? "admin" : parts[2]) as AdminRole;
  const signature = legacy ? parts[1] : parts[3];
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now() || !roles.includes(role)) return null;
  if (userId && !/^[0-9a-f-]{36}$/i.test(userId)) return null;
  const payload = legacy ? expiresAt : `${expiresAt}.${userId}.${role}`;
  const expected = await sign(payload);
  if (signature.length !== expected.length) return null;
  let mismatch = 0;
  for (let index = 0; index < signature.length; index += 1) {
    mismatch |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0 ? { userId, role, expiresAt: Number(expiresAt) } : null;
}

export async function isValidAdminSession(value?: string) {
  return Boolean(await parseAdminSession(value));
}

export const adminSession = {
  cookieName: COOKIE_NAME,
  maxAge: SESSION_DURATION_MS / 1000,
};
