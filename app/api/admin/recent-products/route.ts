export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Products";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // createdAt cursor
  const limit = 10;

  const query: any = {};

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1) // one extra to check if more exists
    .select("name brand createdAt images")
    .populate("brand", "name")
    .lean();

  const hasMore = products.length > limit;
  if (hasMore) products.pop();

  const nextCursor = products.length
    ? products[products.length - 1].createdAt
    : null;

  return NextResponse.json({
    products,
    nextCursor,
    hasMore,
  });
}
