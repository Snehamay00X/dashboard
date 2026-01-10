import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/adminAuth";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });

  return res;
}
