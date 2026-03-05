"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  specification: string;
  color: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  lowStockAlert: number;
  warehouse: string;
}

const CATEGORIES = ["", "Tiles", "Paint", "Cement", "Pipes", "Hardware", "Waterproofing", "Electrical", "Lumber", "Other"];

const defaultForm = {
  name: "", brand: "", category: "", model: "", specification: "",
  color: "", unit: "piece", quantity: 0, purchasePrice: 0, sellingPrice: 0,
  lowStockAlert: 10, warehouse: "",
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const res = await fetch(`/api/products?${params}`);
    setProducts(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search, category]);

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, brand: p.brand, category: p.category, model: p.model,
      specification: p.specification, color: p.color, unit: p.unit,
      quantity: p.quantity, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
      lowStockAlert: p.lowStockAlert, warehouse: p.warehouse,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/products/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/products", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
    }
    setShowModal(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const updateField = (field: string, value: string | number) => setForm({ ...form, [field]: value });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog and inventory"
        actions={
          <Button onClick={openAdd}><Plus size={16} /> Add Product</Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-white focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="Search products by name, brand, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            options={CATEGORIES.map((c) => ({ value: c, label: c || "All Categories" }))}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-48"
          />
        </div>
      </Card>

      {/* Product Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Add your first product to get started." action={<Button onClick={openAdd}><Plus size={16} /> Add Product</Button>} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Spec</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Purchase</TableHead>
                <TableHead>Selling</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{p.model}</TableCell>
                  <TableCell className="text-muted-foreground">{p.specification}</TableCell>
                  <TableCell>{p.color}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      {p.quantity <= p.lowStockAlert && (
                        <AlertTriangle size={14} className="text-warning" />
                      )}
                      <Badge variant={p.quantity <= p.lowStockAlert ? (p.quantity === 0 ? "destructive" : "warning") : "success"}>
                        {p.quantity} {p.unit}
                      </Badge>
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(p.purchasePrice)}</TableCell>
                  <TableCell>{formatCurrency(p.sellingPrice)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-accent"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-accent text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Product" : "Add Product"} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Product Name *" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
            <Input label="Brand" value={form.brand} onChange={(e) => updateField("brand", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select label="Category" options={CATEGORIES.filter(Boolean).map((c) => ({ value: c, label: c }))} value={form.category} onChange={(e) => updateField("category", e.target.value)} />
            <Input label="Model" value={form.model} onChange={(e) => updateField("model", e.target.value)} />
            <Input label="Color" value={form.color} onChange={(e) => updateField("color", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Specification" value={form.specification} onChange={(e) => updateField("specification", e.target.value)} placeholder="e.g. 800x800mm, 5L" />
            <Select label="Unit" options={["piece","box","bag","bucket","drum","roll","meter","set","pair","ton"].map((u) => ({ value: u, label: u }))} value={form.unit} onChange={(e) => updateField("unit", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Purchase Price ($)" type="number" step="0.01" value={form.purchasePrice} onChange={(e) => updateField("purchasePrice", parseFloat(e.target.value) || 0)} />
            <Input label="Selling Price ($)" type="number" step="0.01" value={form.sellingPrice} onChange={(e) => updateField("sellingPrice", parseFloat(e.target.value) || 0)} />
            <Input label="Low Stock Alert" type="number" value={form.lowStockAlert} onChange={(e) => updateField("lowStockAlert", parseInt(e.target.value) || 0)} />
          </div>
          <Input label="Warehouse" value={form.warehouse} onChange={(e) => updateField("warehouse", e.target.value)} placeholder="e.g. Warehouse A" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Product"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
