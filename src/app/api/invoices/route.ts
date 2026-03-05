import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "";
  const status = request.nextUrl.searchParams.get("status") || "";

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;

  const invoices = await prisma.invoice.findMany({
    where,
    include: { customer: true, supplier: true },
    orderBy: { dueDate: "asc" },
    take: 200,
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.dueDate) body.dueDate = new Date(body.dueDate);
  if (body.date) body.date = new Date(body.date);
  body.customerId = body.customerId || null;
  body.supplierId = body.supplierId || null;
  const invoice = await prisma.invoice.create({ data: body });
  return NextResponse.json(invoice, { status: 201 });
}
