"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  Users,
  Truck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface DashboardData {
  stats: {
    productCount: number;
    customerCount: number;
    supplierCount: number;
    totalItems: number;
    totalIncome: number;
    totalExpense: number;
    profit: number;
    totalReceivable: number;
    totalPayable: number;
  };
  lowStockProducts: { id: string; name: string; quantity: number; lowStockAlert: number; brand: string }[];
  recentTransactions: {
    id: string;
    type: string;
    quantity: number;
    totalAmount: number;
    date: string;
    product: { name: string };
    customer: { company: string } | null;
    supplier: { company: string } | null;
  }[];
  monthlyData: { month: string; income: number; expense: number; profit: number }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { stats, lowStockProducts, recentTransactions, monthlyData } = data;

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your business performance" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Products"
          value={String(stats.productCount)}
          change={`${stats.totalItems} items in stock`}
          icon={<Package size={20} className="text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalIncome)}
          change={`Profit: ${formatCurrency(stats.profit)}`}
          changeType={stats.profit > 0 ? "positive" : "negative"}
          icon={<DollarSign size={20} className="text-success" />}
          iconBg="bg-success/10"
        />
        <StatCard
          title="Customers"
          value={String(stats.customerCount)}
          change={`Receivable: ${formatCurrency(stats.totalReceivable)}`}
          icon={<Users size={20} className="text-info" />}
          iconBg="bg-info/10"
        />
        <StatCard
          title="Suppliers"
          value={String(stats.supplierCount)}
          change={`Payable: ${formatCurrency(stats.totalPayable)}`}
          icon={<Truck size={20} className="text-warning" />}
          iconBg="bg-warning/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Revenue Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  formatter={(v) => formatCurrency(Number(v ?? 0))}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
                <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} className="text-success" />
              Monthly Income vs Expense
            </CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  formatter={(v) => formatCurrency(Number(v ?? 0))}
                />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">All products are well stocked.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.brand}</TableCell>
                    <TableCell>
                      <Badge variant={p.quantity === 0 ? "destructive" : "warning"}>
                        {p.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.lowStockAlert}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={18} className="text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No transactions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        {t.type === "IN" ? (
                          <ArrowDownCircle size={14} className="text-success" />
                        ) : (
                          <ArrowUpCircle size={14} className="text-info" />
                        )}
                        <Badge variant={t.type === "IN" ? "success" : "default"}>
                          {t.type === "IN" ? "Stock In" : "Stock Out"}
                        </Badge>
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{t.product.name}</TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>{formatCurrency(t.totalAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
