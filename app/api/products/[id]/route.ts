export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Products";
import { validateAttributes } from "@/helpers/validateAttributes";
import mongoose from "mongoose";

/* ================= GET SINGLE PRODUCT ================= */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await ctx.params; // ✅ correct in Next 16

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid product id" },
      { status: 400 }
    );
  }

  const product = await Product.findById(id).lean();

  if (!product) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}

/* ================= UPDATE PRODUCT ================= */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await ctx.params; // ✅

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid product id" },
      { status: 400 }
    );
  }

  const body = await req.json();

  if (body.attributes) {
    await validateAttributes(body.attributes);
  }

  const updated = await Product.findByIdAndUpdate(id, body, {
    new: true,
  }).lean();

  if (!updated) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}

/* ================= DELETE PRODUCT ================= */
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await ctx.params; // ✅

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid product id" },
      { status: 400 }
    );
  }

  const deleted = await Product.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Product deleted successfully",
  });
}
