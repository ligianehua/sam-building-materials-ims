export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || "";
  const category = request.nextUrl.searchParams.get("category") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { brand: { contains: search } },
      { model: { contains: search } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await prisma.product.create({ data: body });
  return NextResponse.json(product, { status: 201 });
}
