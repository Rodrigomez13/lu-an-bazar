const COOKIE_NAME = "luan_admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

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

export async function createAdminSessionValue() {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  return `${expiresAt}.${await sign(String(expiresAt))}`;
}

export async function isValidAdminSession(value?: string) {
  if (!value || !getSecret()) return false;
  const [expiresAt, signature, extra] = value.split(".");
  if (extra || !expiresAt || !signature || Number(expiresAt) <= Date.now())
    return false;
  const expected = await sign(expiresAt);
  if (signature.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < signature.length; index += 1) {
    mismatch |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

export const adminSession = {
  cookieName: COOKIE_NAME,
  maxAge: SESSION_DURATION_MS / 1000,
};
