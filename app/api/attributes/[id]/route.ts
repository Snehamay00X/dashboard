export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import AttributeDefinition from "@/models/AttributeDefinition";
import Product from "@/models/Products";
import mongoose from "mongoose";

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

  // Find attribute
  const attr = await AttributeDefinition.findById(id).lean();

  if (!attr) {
    return NextResponse.json(
      { message: "Attribute not found" },
      { status: 404 }
    );
  }

  // 🔒 Check if any product uses this attribute
  const inUse = await Product.exists({
    [`attributes.${attr.key}`]: { $exists: true },
  });

  if (inUse) {
    return NextResponse.json(
      {
        message: `Attribute "${attr.label}" is used by products and cannot be deleted`,
      },
      { status: 409 } // Conflict
    );
  }

  // Safe to delete
  await AttributeDefinition.findByIdAndDelete(id);

  return NextResponse.json(
    { message: "Attribute deleted", id },
    { status: 200 }
  );
}
