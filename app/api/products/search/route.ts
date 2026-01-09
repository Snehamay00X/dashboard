import {dbConnect} from "@/lib/dbConnect";
import Product from "@/models/Products";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  const params = req.nextUrl.searchParams;

  const query: any = { isActive: true };

  params.forEach((value, key) => {
    query[`attributes.${key}`] = value;
  });

  const products = await Product.find(query).limit(20);
  return NextResponse.json(products);
}
