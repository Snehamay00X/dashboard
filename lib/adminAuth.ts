import crypto from "crypto";

export const COOKIE_NAME = "admin_session";

export function signSession(username: string) {
  const secret = process.env.ADMIN_SECRET!;
  const payload = `${username}.${Date.now()}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export function verifySession(token: string) {
  try {
    const [username, timestamp, signature] = token.split(".");
    const secret = process.env.ADMIN_SECRET!;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${username}.${timestamp}`)
      .digest("hex");

    if (signature !== expected) return false;
    if (username !== process.env.ADMIN_USERNAME) return false;

    // 7 days expiry
    const age = Date.now() - Number(timestamp);
    if (age > 7 * 24 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}
