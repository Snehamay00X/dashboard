export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import AttributeDefinition from "@/models/AttributeDefinition";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();
  const attrs = await AttributeDefinition.find().sort({ label: 1 });
  return NextResponse.json(attrs);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  const attr = await AttributeDefinition.create(body);
  return NextResponse.json(attr, { status: 201 });
}


