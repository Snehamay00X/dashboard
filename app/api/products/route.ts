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

  // 1️⃣ Validate attributes
  await validateAttributes(body.attributes || {});

  // 2️⃣ Validate brand
  const brand = await Brand.findById(body.brand);
  if (!brand || !brand.isActive) {
    return NextResponse.json(
      { message: "Selected brand is disabled" },
      { status: 400 }
    );
  }

  // 3️⃣ Check if product already exists by name (case-insensitive)
  const existingProduct = await Product.findOne({
    name: { $regex: `^${body.name}$`, $options: "i" },
  });

  if (existingProduct) {
    return NextResponse.json(
      { message: "Product with this name already exists" },
      { status: 409 } // Conflict
    );
  }

  // 4️⃣ Build indexed search text
  body.searchText = buildSearchText(body);

  // 5️⃣ Create product
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
    const isActive = searchParams.get("isActive");
    const hasImages = searchParams.get("hasImages");

    const match: any = {};

    /* ---------- Brand ---------- */
    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
      match.brand = new mongoose.Types.ObjectId(brand);
    }

    /* ---------- Active ---------- */
    if (isActive === "true") match.isActive = true;
    if (isActive === "false") match.isActive = false;

    /* ---------- Search (name + attributes) ---------- */
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

    /* ---------- Image filter ---------- */
    if (hasImages === "true") {
      match.$expr = {
        ...(match.$expr || {}),
        $gt: [{ $size: { $ifNull: ["$images", []] } }, 0],
      };
    }

    if (hasImages === "false") {
      match.$expr = {
        ...(match.$expr || {}),
        $eq: [{ $size: { $ifNull: ["$images", []] } }, 0],
      };
    }

    /* ---------- Main pipeline ---------- */
    const basePipeline: PipelineStage[] = [
      { $match: match },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
    ];

    /* ---------- Products ---------- */
    const productsPipeline: PipelineStage[] = [
      ...basePipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          brand: { _id: 1, name: 1 },
          createdAt: 1,
          isActive: 1,
        },
      },
    ];

    /* ---------- Count ---------- */
    const countPipeline: PipelineStage[] = [
      ...basePipeline,
      { $count: "total" },
    ];

    const [products, countResult] = await Promise.all([
      Product.aggregate(productsPipeline),
      Product.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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


