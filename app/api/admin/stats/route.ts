export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Products";
import Brand from "@/models/Brands";
import AttributeDefinition from "@/models/AttributeDefinition";

export async function GET() {
  await dbConnect();

  const [
    totalProducts,
    activeProducts,
    totalBrands,
    activeBrands,
    totalAttributes,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Brand.countDocuments(),
    Brand.countDocuments({ isActive: true }),
    AttributeDefinition.countDocuments(),
  ]);

  return NextResponse.json({
    products: {
      total: totalProducts,
      active: activeProducts,
    },
    brands: {
      total: totalBrands,
      active: activeBrands,
    },
    attributes: {
      total: totalAttributes,
    },
  });
}
