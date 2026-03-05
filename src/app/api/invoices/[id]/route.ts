export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (body.dueDate) body.dueDate = new Date(body.dueDate);

  // Auto-update status based on payment
  if (body.paidAmount !== undefined) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (invoice) {
      if (body.paidAmount >= invoice.amount) {
        body.status = "PAID";
      } else if (body.paidAmount > 0) {
        body.status = "PARTIAL";
      } else {
        body.status = "PENDING";
      }
    }
  }

  const invoice = await prisma.invoice.update({ where: { id }, data: body });
  return NextResponse.json(invoice);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
