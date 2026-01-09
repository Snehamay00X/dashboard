export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Brand from "@/models/Brands";
import Product from "@/models/Products";

import slugify from "slugify";

/* ---------- CREATE BRAND ---------- */
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  const brand = await Brand.create({
    name: body.name,
    slug: slugify(body.name, { lower: true, strict: true }),
    website: body.website,
  });

  return NextResponse.json(brand, { status: 201 });
}

/* ---------- LIST BRANDS ---------- */
// export async function GET() {
//   await dbConnect();
//   const brands = await Brand.find().sort({ name: 1 });
//   return NextResponse.json(brands);
// }
/* ---------- LIST BRANDS WITH USAGE COUNT ---------- */
export async function GET() {
  await dbConnect();

  const brands = await Brand.aggregate([
    {
      $lookup: {
        from: "products",          // Mongo collection name
        localField: "_id",
        foreignField: "brand",
        as: "products",
      },
    },
    {
      $addFields: {
        productCount: { $size: "$products" },
      },
    },
    {
      $project: {
        products: 0, // don't send full products array
      },
    },
    { $sort: { name: 1 } },
  ]);

  return NextResponse.json(brands);
}
