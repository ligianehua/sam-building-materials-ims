"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/suppliers/${id}`)
      .then((r) => r.json())
      .then(setSupplier)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>;
  if (!supplier) return <div className="text-center py-16 text-muted-foreground">Supplier not found</div>;

  const tags = (() => { try { return JSON.parse(supplier.tags) || []; } catch { return []; } })();

  return (
    <div>
      <PageHeader title={supplier.company} description="Supplier details" actions={<Button variant="outline" onClick={() => router.push("/suppliers")}><ArrowLeft size={16} /> Back to List</Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6">
            <div><p className="text-sm text-muted-foreground mb-1">Company</p><p className="font-medium">{supplier.company}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Industry</p><p className="font-medium">{supplier.industry || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Contact Name</p><p className="font-medium">{supplier.contactName || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Phone</p><p className="font-medium">{supplier.phone || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Mobile</p><p className="font-medium">{supplier.mobile || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Address</p><p className="font-medium">{supplier.address || "-"}</p></div>
          </div>
        </Card>
        <Card>
          <div className="space-y-4">
            <div><p className="text-sm text-muted-foreground mb-1">Rating</p><Rating value={supplier.rating} readonly /></div>
            <div><p className="text-sm text-muted-foreground mb-1">Tags</p><div className="flex flex-wrap gap-1">{tags.map((t: string, i: number) => <Badge key={i}>{t}</Badge>)}</div></div>
            <div><p className="text-sm text-muted-foreground mb-1">Created</p><p className="text-sm">{formatDate(supplier.createdAt)}</p></div>
          </div>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-4">Purchase History</h2>
      {supplier.stockTransactions?.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplier.stockTransactions.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                  <TableCell><Badge variant="success">Stock In</Badge></TableCell>
                  <TableCell className="font-medium">{t.product?.name}</TableCell>
                  <TableCell>{t.quantity}</TableCell>
                  <TableCell>{formatCurrency(t.totalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card><p className="text-sm text-muted-foreground text-center py-8">No purchase records yet.</p></Card>
      )}
    </div>
  );
}
