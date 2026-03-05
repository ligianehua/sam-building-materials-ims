"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/empty-state";
import { Rating } from "@/components/ui/rating";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface Customer {
  id: string; company: string; industry: string; contactName: string;
  phone: string; mobile: string; address: string; tags: string; rating: number;
}

const defaultForm = { company: "", industry: "", contactName: "", phone: "", mobile: "", address: "", tags: "", rating: 3, notes: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchCustomers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/customers?${params}`);
    setCustomers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const parseTags = (tags: string): string[] => {
    try { return JSON.parse(tags) || []; } catch { return []; }
  };

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      company: c.company, industry: c.industry, contactName: c.contactName,
      phone: c.phone, mobile: c.mobile, address: c.address,
      tags: parseTags(c.tags).join(", "), rating: c.rating, notes: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    if (editing) {
      await fetch(`/api/customers/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowModal(false);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    fetchCustomers();
  };

  return (
    <div>
      <PageHeader title="Customers" description="Manage your customer database" actions={<Button onClick={openAdd}><Plus size={16} /> Add Customer</Button>} />

      <Card className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-white focus:ring-2 focus:ring-ring focus:outline-none" placeholder="Search by company, contact, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
      ) : customers.length === 0 ? (
        <EmptyState title="No customers found" description="Add your first customer to get started." action={<Button onClick={openAdd}><Plus size={16} /> Add Customer</Button>} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.company}</TableCell>
                  <TableCell className="text-muted-foreground">{c.industry}</TableCell>
                  <TableCell>{c.contactName}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{c.mobile}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {parseTags(c.tags).map((tag, i) => (
                        <Badge key={i} variant="default">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell><Rating value={c.rating} readonly size={14} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-accent"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-accent text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Customer" : "Add Customer"} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Company Name *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Residential Construction" />
            <Input label="Contact Name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. VIP, Wholesale, Retail" />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rating</label>
            <Rating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Customer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
