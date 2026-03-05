export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "";
  const productId = request.nextUrl.searchParams.get("productId") || "";

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (productId) where.productId = productId;

  const transactions = await prisma.stockTransaction.findMany({
    where,
    include: { product: true, customer: true, supplier: true },
    orderBy: { date: "desc" },
    take: 200,
  });

  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, productId, quantity, unitPrice, supplierId, customerId, batchNumber, orderRef, note, date } = body;

  const totalAmount = quantity * unitPrice;

  // Create transaction
  const transaction = await prisma.stockTransaction.create({
    data: {
      type,
      productId,
      quantity,
      unitPrice,
      totalAmount,
      supplierId: supplierId || null,
      customerId: customerId || null,
      batchNumber: batchNumber || "",
      orderRef: orderRef || "",
      note: note || "",
      date: date ? new Date(date) : new Date(),
    },
  });

  // Update product quantity
  if (type === "IN") {
    await prisma.product.update({
      where: { id: productId },
      data: { quantity: { increment: quantity } },
    });
  } else {
    await prisma.product.update({
      where: { id: productId },
      data: { quantity: { decrement: quantity } },
    });
  }

  // Create financial record
  await prisma.financialRecord.create({
    data: {
      type: type === "IN" ? "EXPENSE" : "INCOME",
      category: type === "IN" ? "Purchase" : "Sales",
      amount: totalAmount,
      description: `Stock ${type === "IN" ? "In" : "Out"} - ${quantity} units`,
      relatedType: type === "IN" ? "STOCK_IN" : "STOCK_OUT",
      relatedId: transaction.id,
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
