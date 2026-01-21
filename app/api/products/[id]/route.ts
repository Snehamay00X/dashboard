export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Products";
import { validateAttributes } from "@/helpers/validateAttributes";
import mongoose from "mongoose";
import { buildSearchText } from "@/lib/buildSearchText";

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

  const { id } = await ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid product id" },
      { status: 400 }
    );
  }

  const body = await req.json();

  // 1️⃣ Load existing product ONCE
  const existingProduct = await Product.findById(id).lean();
  if (!existingProduct) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  // 2️⃣ Validate attributes
  if (body.attributes) {
    await validateAttributes(body.attributes);
  }

  // 3️⃣ Validate images
  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      return NextResponse.json(
        { message: "Invalid images format" },
        { status: 400 }
      );
    }
    body.images = body.images.filter(Boolean);
  }

  // 4️⃣ Prevent duplicate name
  if (body.name) {
    const duplicate = await Product.findOne({
      _id: { $ne: id },
      name: { $regex: `^${body.name}$`, $options: "i" },
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "Product with this name already exists" },
        { status: 409 }
      );
    }
  }

  // 5️⃣ Build search text SAFELY
  const mergedForSearch = {
    ...existingProduct,
    ...body,
  };

  body.searchText = buildSearchText(mergedForSearch);

  // 6️⃣ Update
  const updated = await Product.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  }).lean();

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
