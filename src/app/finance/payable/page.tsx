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
import { Plus, DollarSign, AlertCircle } from "lucide-react";

interface Invoice {
  id: string; type: string; amount: number; paidAmount: number; status: string;
  dueDate: string; description: string; date: string;
  supplier: { id: string; company: string } | null;
}
interface Supplier { id: string; company: string; }

export default function PayablePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showPayment, setShowPayment] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [form, setForm] = useState({ supplierId: "", amount: 0, dueDate: "", description: "" });

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: "PAYABLE" });
    if (statusFilter) params.set("status", statusFilter);
    const [inv, sup] = await Promise.all([
      fetch(`/api/invoices?${params}`).then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()),
    ]);
    setInvoices(inv);
    setSuppliers(sup);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/invoices", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: "PAYABLE", date: new Date().toISOString() }),
    });
    setShowAdd(false);
    setForm({ supplierId: "", amount: 0, dueDate: "", description: "" });
    fetchData();
  };

  const handlePayment = async () => {
    if (!showPayment || payAmount <= 0) return;
    const newPaid = showPayment.paidAmount + payAmount;
    await fetch(`/api/invoices/${showPayment.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paidAmount: newPaid }),
    });
    setShowPayment(null);
    setPayAmount(0);
    fetchData();
  };

  const isOverdue = (inv: Invoice) => new Date(inv.dueDate) < new Date() && inv.status !== "PAID";
  const totalOutstanding = invoices.reduce((s, i) => s + (i.amount - i.paidAmount), 0);

  return (
    <div>
      <PageHeader title="Accounts Payable" description="Track supplier payments and outstanding bills" actions={<Button onClick={() => setShowAdd(true)}><Plus size={16} /> New Bill</Button>} />

      <Card className="mb-6 !p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalOutstanding)}</p>
          </div>
          <Select options={[{ value: "", label: "All Status" }, { value: "PENDING", label: "Pending" }, { value: "PARTIAL", label: "Partial" }, { value: "PAID", label: "Paid" }]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" />
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
      ) : invoices.length === 0 ? (
        <EmptyState title="No payable bills" description="Create your first supplier bill." action={<Button onClick={() => setShowAdd(true)}><Plus size={16} /> New Bill</Button>} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.supplier?.company || "-"}</TableCell>
                  <TableCell>{formatCurrency(inv.amount)}</TableCell>
                  <TableCell className="text-success">{formatCurrency(inv.paidAmount)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(inv.amount - inv.paidAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "PAID" ? "success" : inv.status === "PARTIAL" ? "default" : "warning"}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1 ${isOverdue(inv) ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {isOverdue(inv) && <AlertCircle size={14} />}
                      {formatDate(inv.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{inv.description || "-"}</TableCell>
                  <TableCell>
                    {inv.status !== "PAID" && (
                      <Button size="sm" variant="outline" onClick={() => { setShowPayment(inv); setPayAmount(0); }}>
                        <DollarSign size={14} /> Pay
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Bill Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Payable Bill">
        <form onSubmit={handleAdd} className="space-y-4">
          <Select label="Supplier *" options={[{ value: "", label: "Select supplier..." }, ...suppliers.map((s) => ({ value: s.id, label: s.company }))]} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required />
          <Input label="Amount ($) *" type="number" step="0.01" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required />
          <Input label="Due Date *" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit">Create Bill</Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal open={!!showPayment} onClose={() => setShowPayment(null)} title="Record Payment">
        <div className="space-y-4">
          {showPayment && (
            <>
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <p>Bill Amount: <strong>{formatCurrency(showPayment.amount)}</strong></p>
                <p>Already Paid: <strong>{formatCurrency(showPayment.paidAmount)}</strong></p>
                <p>Remaining: <strong>{formatCurrency(showPayment.amount - showPayment.paidAmount)}</strong></p>
              </div>
              <Input label="Payment Amount ($)" type="number" step="0.01" min={0} max={showPayment.amount - showPayment.paidAmount} value={payAmount} onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)} />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowPayment(null)}>Cancel</Button>
                <Button onClick={handlePayment} disabled={payAmount <= 0}>Confirm Payment</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
