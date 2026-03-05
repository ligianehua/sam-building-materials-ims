"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, FileText } from "lucide-react";

interface Record { id: string; type: string; category: string; amount: number; description: string; date: string; }

const CATEGORIES = ["Sales", "Purchase", "Shipping", "Rent", "Salary", "Other"];

export default function FinanceRecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "INCOME", category: "Sales", amount: 0, description: "", date: new Date().toISOString().split("T")[0] });

  const fetchRecords = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (catFilter) params.set("category", catFilter);
    const res = await fetch(`/api/finance?${params}`);
    setRecords(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, [typeFilter, catFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false);
    setForm({ type: "INCOME", category: "Sales", amount: 0, description: "", date: new Date().toISOString().split("T")[0] });
    fetchRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/finance/${id}`, { method: "DELETE" });
    fetchRecords();
  };

  const totalIncome = records.filter((r) => r.type === "INCOME").reduce((s, r) => s + r.amount, 0);
  const totalExpense = records.filter((r) => r.type === "EXPENSE").reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <PageHeader title="Financial Records" description="Track all income and expense transactions" actions={<Button onClick={() => setShowModal(true)}><Plus size={16} /> Add Record</Button>} />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="!p-4"><p className="text-sm text-muted-foreground">Total Income</p><p className="text-xl font-bold text-success">{formatCurrency(totalIncome)}</p></Card>
        <Card className="!p-4"><p className="text-sm text-muted-foreground">Total Expense</p><p className="text-xl font-bold text-destructive">{formatCurrency(totalExpense)}</p></Card>
        <Card className="!p-4"><p className="text-sm text-muted-foreground">Net</p><p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(totalIncome - totalExpense)}</p></Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <Select options={[{ value: "", label: "All Types" }, { value: "INCOME", label: "Income" }, { value: "EXPENSE", label: "Expense" }]} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40" />
          <Select options={[{ value: "", label: "All Categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="w-40" />
          <span className="text-sm text-muted-foreground self-center">{records.length} records</span>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
      ) : records.length === 0 ? (
        <EmptyState title="No records found" description="Add your first financial record." action={<Button onClick={() => setShowModal(true)}><Plus size={16} /> Add Record</Button>} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-muted-foreground">{formatDate(r.date)}</TableCell>
                  <TableCell><Badge variant={r.type === "INCOME" ? "success" : "destructive"}>{r.type}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                  <TableCell className="max-w-[250px] truncate">{r.description || "-"}</TableCell>
                  <TableCell className={`font-medium ${r.type === "INCOME" ? "text-success" : "text-destructive"}`}>
                    {r.type === "INCOME" ? "+" : "-"}{formatCurrency(r.amount)}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-accent text-destructive"><Trash2 size={14} /></button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Financial Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Type *" options={[{ value: "INCOME", label: "Income" }, { value: "EXPENSE", label: "Expense" }]} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <Select label="Category *" options={CATEGORIES.map((c) => ({ value: c, label: c }))} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Amount ($) *" type="number" step="0.01" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Add Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
