export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Brand from "@/models/Brands";
import slugify from "slugify";
import mongoose from "mongoose";

/* ---------- UPDATE (Edit + Enable) ---------- */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await ctx.params; // Next 16 fix

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid brand id" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const update: any = {};

  // If name is provided, update name + slug
  if (body.name) {
    update.name = body.name;
    update.slug = slugify(body.name, {
      lower: true,
      strict: true,
    });
  }

  // Optional fields
  if ("website" in body) update.website = body.website;
  if ("isActive" in body) update.isActive = body.isActive;

  const brand = await Brand.findByIdAndUpdate(id, update, {
    new: true,
  }).lean();

  if (!brand) {
    return NextResponse.json(
      { message: "Brand not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(brand);
}

/* ---------- DISABLE (soft delete) ---------- */
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await ctx.params; // Next 16 fix

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid brand id" },
      { status: 400 }
    );
  }

  const updated = await Brand.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json(
      { message: "Brand not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}
