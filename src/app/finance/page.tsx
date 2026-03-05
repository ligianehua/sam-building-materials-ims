"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Receipt, CreditCard } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function FinanceDashboard() {
  const [dashData, setDashData] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/finance").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ]).then(([dash, fin, inv]) => {
      setDashData(dash);
      setRecords(fin);
      setInvoices(inv);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!dashData) return null;

  const { stats, monthlyData } = dashData;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  records.forEach((r: any) => {
    const cat = r.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + r.amount;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value);

  // AR/AP summary
  const receivable = invoices.filter((i: any) => i.type === "RECEIVABLE" && i.status !== "PAID");
  const payable = invoices.filter((i: any) => i.type === "PAYABLE" && i.status !== "PAID");
  const totalAR = receivable.reduce((s: number, i: any) => s + (i.amount - i.paidAmount), 0);
  const totalAP = payable.reduce((s: number, i: any) => s + (i.amount - i.paidAmount), 0);
  const arApData = [
    { name: "Receivable", value: Math.round(totalAR * 100) / 100 },
    { name: "Payable", value: Math.round(totalAP * 100) / 100 },
  ];

  // Cash flow (net)
  const cashFlowData = monthlyData.map((m: any) => ({ ...m, net: m.income - m.expense }));

  return (
    <div>
      <PageHeader title="Financial Overview" description="Analyze your business finances at a glance" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Income" value={formatCurrency(stats.totalIncome)} icon={<TrendingUp size={20} className="text-success" />} iconBg="bg-success/10" changeType="positive" change="Revenue from sales" />
        <StatCard title="Total Expense" value={formatCurrency(stats.totalExpense)} icon={<TrendingDown size={20} className="text-destructive" />} iconBg="bg-destructive/10" changeType="negative" change="Purchase & operations" />
        <StatCard title="Net Profit" value={formatCurrency(stats.profit)} icon={<DollarSign size={20} className="text-primary" />} iconBg="bg-primary/10" changeType={stats.profit >= 0 ? "positive" : "negative"} change={`Margin: ${stats.totalIncome > 0 ? ((stats.profit / stats.totalIncome) * 100).toFixed(1) : 0}%`} />
        <StatCard title="Outstanding Balance" value={formatCurrency(totalAR - totalAP)} icon={<BarChart3 size={20} className="text-warning" />} iconBg="bg-warning/10" change={`AR: ${formatCurrency(totalAR)} | AP: ${formatCurrency(totalAP)}`} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Revenue vs Cost Trend</CardTitle></CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
                <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={2} name="Profit" dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={18} className="text-info" /> Spending by Category</CardTitle></CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" fontSize={12} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" fontSize={12} stroke="#94a3b8" width={80} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Amount">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign size={18} className="text-success" /> Cash Flow Trend</CardTitle></CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="net" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} name="Net Cash Flow" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AR/AP Overview */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Receipt size={18} className="text-warning" /> Accounts Overview</CardTitle></CardHeader>
          <div className="h-72 flex items-center justify-center">
            <div className="w-full max-w-xs">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={arApData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${formatCurrency(value)}`} labelLine={false}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-info" /> Receivable</div>
                <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-destructive" /> Payable</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
