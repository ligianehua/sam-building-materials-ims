import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "";
  const category = request.nextUrl.searchParams.get("category") || "";

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (category) where.category = category;

  const records = await prisma.financialRecord.findMany({
    where,
    orderBy: { date: "desc" },
    take: 200,
  });

  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.date) body.date = new Date(body.date);
  const record = await prisma.financialRecord.create({ data: body });
  return NextResponse.json(record, { status: 201 });
}
