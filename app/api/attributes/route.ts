export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import AttributeDefinition from "@/models/AttributeDefinition";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();
  const attrs = await AttributeDefinition.find().sort({ label: 1 });
  return NextResponse.json(attrs);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  const attr = await AttributeDefinition.create(body);
  return NextResponse.json(attr, { status: 201 });
}

/* ================= DELETE ATTRIBUTE ================= */
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await ctx.params; // ✅ Next.js 16 fix

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid attribute id" },
      { status: 400 }
    );
  }

  const deleted = await AttributeDefinition.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json(
      { message: "Attribute not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { message: "Attribute deleted", id },
    { status: 200 }
  );
}
