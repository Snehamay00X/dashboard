import { signSession, COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return new Response(
      JSON.stringify({ error: "Invalid credentials" }),
      { status: 401 }
    );
  }

  const token = signSession(username);

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; ${
          process.env.NODE_ENV === "production" ? "Secure;" : ""
        }`,
        "Content-Type": "application/json",
      },
    }
  );
}
