"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PackageMinus } from "lucide-react";

interface Product { id: string; name: string; brand: string; unit: string; quantity: number; sellingPrice: number; }
interface Customer { id: string; company: string; }

export default function StockOutPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({
    productId: "", customerId: "", quantity: 1, unitPrice: 0, orderRef: "", date: new Date().toISOString().split("T")[0], note: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
  }, []);

  const selectedProduct = products.find((p) => p.id === form.productId);

  useEffect(() => {
    if (selectedProduct) setForm((f) => ({ ...f, unitPrice: selectedProduct.sellingPrice }));
  }, [form.productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || form.quantity <= 0) return;
    if (selectedProduct && form.quantity > selectedProduct.quantity) {
      setError(`Insufficient stock. Available: ${selectedProduct.quantity} ${selectedProduct.unit}`);
      return;
    }
    setError("");
    setSubmitting(true);
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: "OUT" }),
    });
    setSubmitting(false);
    router.push("/inventory/history");
  };

  return (
    <div>
      <PageHeader title="Stock Out" description="Record outgoing inventory to customers" />
      <Card className="max-w-3xl w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Product *"
            options={[{ value: "", label: "Select a product..." }, ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.brand}) - Stock: ${p.quantity} ${p.unit}` }))]}
            value={form.productId}
            onChange={(e) => { setForm({ ...form, productId: e.target.value }); setError(""); }}
            required
          />
          {selectedProduct && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm flex items-center gap-4">
              <span>Available Stock: <strong>{selectedProduct.quantity} {selectedProduct.unit}</strong></span>
              <span>Suggested Price: <strong>${selectedProduct.sellingPrice.toFixed(2)}</strong></span>
            </div>
          )}
          <Select
            label="Customer"
            options={[{ value: "", label: "Select a customer (optional)..." }, ...customers.map((c) => ({ value: c.id, label: c.company }))]}
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity *" type="number" min={1} value={form.quantity} onChange={(e) => { setForm({ ...form, quantity: parseInt(e.target.value) || 0 }); setError(""); }} error={error} required />
            <Input label="Unit Price ($) *" type="number" step="0.01" min={0} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} required />
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <span className="text-muted-foreground">Total Amount: </span>
            <span className="font-semibold text-foreground">${(form.quantity * form.unitPrice).toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Order Reference" value={form.orderRef} onChange={(e) => setForm({ ...form, orderRef: e.target.value })} placeholder="e.g. ORD-001" />
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <Textarea label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={submitting || !form.productId}>
              <PackageMinus size={16} /> {submitting ? "Processing..." : "Record Stock Out"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
