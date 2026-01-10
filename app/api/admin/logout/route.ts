import { COOKIE_NAME } from "@/lib/adminAuth";

export async function POST() {
  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=; Path=/; Max-Age=0`,
      },
    }
  );
}
