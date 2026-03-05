"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PackagePlus } from "lucide-react";

interface Product { id: string; name: string; brand: string; unit: string; quantity: number; purchasePrice: number; }
interface Supplier { id: string; company: string; }

export default function StockInPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    productId: "", supplierId: "", quantity: 1, unitPrice: 0, batchNumber: "", date: new Date().toISOString().split("T")[0], note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);
  }, []);

  const selectedProduct = products.find((p) => p.id === form.productId);

  useEffect(() => {
    if (selectedProduct) setForm((f) => ({ ...f, unitPrice: selectedProduct.purchasePrice }));
  }, [form.productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || form.quantity <= 0) return;
    setSubmitting(true);
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: "IN" }),
    });
    setSubmitting(false);
    router.push("/inventory/history");
  };

  return (
    <div>
      <PageHeader title="Stock In" description="Record incoming inventory from suppliers" />
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Product *"
            options={[{ value: "", label: "Select a product..." }, ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.brand}) - Stock: ${p.quantity} ${p.unit}` }))]}
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            required
          />
          <Select
            label="Supplier"
            options={[{ value: "", label: "Select a supplier (optional)..." }, ...suppliers.map((s) => ({ value: s.id, label: s.company }))]}
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity *" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} required />
            <Input label="Unit Price ($) *" type="number" step="0.01" min={0} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} required />
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <span className="text-muted-foreground">Total Amount: </span>
            <span className="font-semibold text-foreground">${(form.quantity * form.unitPrice).toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Batch Number" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} placeholder="e.g. B20260301" />
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <Textarea label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={submitting || !form.productId}>
              <PackagePlus size={16} /> {submitting ? "Processing..." : "Record Stock In"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
