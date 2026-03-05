export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    productCount,
    customerCount,
    supplierCount,
    lowStockProducts,
    recentTransactions,
    totalInventoryValue,
    monthlyFinance,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.customer.count(),
    prisma.supplier.count(),
    prisma.product.findMany({
      where: { quantity: { lte: prisma.product.fields.lowStockAlert ? undefined : 10 } },
      orderBy: { quantity: "asc" },
      take: 5,
    }),
    prisma.stockTransaction.findMany({
      include: { product: true, customer: true, supplier: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.product.aggregate({
      _sum: { quantity: true },
    }),
    prisma.financialRecord.findMany({
      orderBy: { date: "desc" },
      take: 100,
    }),
  ]);

  // Calculate low stock properly
  const allProducts = await prisma.product.findMany();
  const lowStock = allProducts
    .filter((p) => p.quantity <= p.lowStockAlert)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  // Calculate totals
  const totalIncome = monthlyFinance
    .filter((r) => r.type === "INCOME")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = monthlyFinance
    .filter((r) => r.type === "EXPENSE")
    .reduce((sum, r) => sum + r.amount, 0);

  // Monthly revenue data for chart (last 6 months)
  const now = new Date();
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthLabel = monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    const records = await prisma.financialRecord.findMany({
      where: {
        date: { gte: monthStart, lte: monthEnd },
      },
    });

    const income = records.filter((r) => r.type === "INCOME").reduce((s, r) => s + r.amount, 0);
    const expense = records.filter((r) => r.type === "EXPENSE").reduce((s, r) => s + r.amount, 0);

    monthlyData.push({
      month: monthLabel,
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      profit: Math.round((income - expense) * 100) / 100,
    });
  }

  // Invoices summary
  const receivables = await prisma.invoice.findMany({ where: { type: "RECEIVABLE", status: { not: "PAID" } } });
  const payables = await prisma.invoice.findMany({ where: { type: "PAYABLE", status: { not: "PAID" } } });
  const totalReceivable = receivables.reduce((s, i) => s + (i.amount - i.paidAmount), 0);
  const totalPayable = payables.reduce((s, i) => s + (i.amount - i.paidAmount), 0);

  return NextResponse.json({
    stats: {
      productCount,
      customerCount,
      supplierCount,
      totalItems: totalInventoryValue._sum.quantity || 0,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      profit: Math.round((totalIncome - totalExpense) * 100) / 100,
      totalReceivable: Math.round(totalReceivable * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
    },
    lowStockProducts: lowStock,
    recentTransactions,
    monthlyData,
  });
}
