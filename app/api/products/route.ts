export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Products";
import Brand from "@/models/Brands";
import { validateAttributes } from "@/helpers/validateAttributes";
import mongoose,{PipelineStage} from "mongoose";

/* ================= HELPERS ================= */

function buildSearchText(body: any) {
  return [
    body.name,
    ...Object.values(body.attributes || {}),
  ]
    .join(" ")
    .toLowerCase();
}

/* ================= CREATE PRODUCT ================= */
export async function POST(req: NextRequest) {
  await dbConnect();

  const body = await req.json();

  await validateAttributes(body.attributes || {});

  const brand = await Brand.findById(body.brand);
  if (!brand || !brand.isActive) {
    return NextResponse.json(
      { message: "Selected brand is disabled" },
      { status: 400 }
    );
  }

  // 🔥 Build indexed search text
  body.searchText = buildSearchText(body);

  const product = await Product.create(body);

  return NextResponse.json(product, { status: 201 });
}

/* ================= LIST + SEARCH PRODUCTS ================= */
/**
 * GET /api/products?page=1&limit=10&search=15mm&brand=123
 */


export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;

    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
    const skip = (page - 1) * limit;

    const brand = searchParams.get("brand");
    const search = searchParams.get("search")?.trim();

    const match: any = { isActive: true };

    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
      match.brand = new mongoose.Types.ObjectId(brand);
    }

    if (search) {
      const regex = new RegExp(search, "i");

      match.$or = [
        { name: regex },
        {
          $expr: {
            $regexMatch: {
              input: {
                $reduce: {
                  input: { $objectToArray: "$attributes" },
                  initialValue: "",
                  in: { $concat: ["$$value", " ", "$$this.v"] },
                },
              },
              regex,
            },
          },
        },
      ];
    }

    const pipeline:PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          brand: { _id: 1, name: 1 },
          createdAt: 1,
        },
      },
    ];

    const [products, count] = await Promise.all([
      Product.aggregate(pipeline),
      Product.countDocuments(match),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("Products API error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

