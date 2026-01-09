import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
  const timestamp = Math.round(Date.now() / 1000);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const stringToSign = `folder=products&timestamp=${timestamp}${apiSecret}`;

  const signature = crypto
    .createHash("sha1")
    .update(stringToSign)
    .digest("hex");

  return NextResponse.json({
    timestamp,
    signature,
    apiKey,
    cloudName,
  });
}
