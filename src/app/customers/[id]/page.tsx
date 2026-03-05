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
import { ArrowLeft, Building2, Phone, MapPin, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((r) => r.json())
      .then(setCustomer)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>;
  if (!customer) return <div className="text-center py-16 text-muted-foreground">Customer not found</div>;

  const tags = (() => { try { return JSON.parse(customer.tags) || []; } catch { return []; } })();

  return (
    <div>
      <PageHeader title={customer.company} description="Customer details" actions={<Button variant="outline" onClick={() => router.push("/customers")}><ArrowLeft size={16} /> Back to List</Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6">
            <div><p className="text-sm text-muted-foreground mb-1">Company</p><p className="font-medium">{customer.company}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Industry</p><p className="font-medium">{customer.industry || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Contact Name</p><p className="font-medium">{customer.contactName || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Phone</p><p className="font-medium">{customer.phone || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Mobile</p><p className="font-medium">{customer.mobile || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Address</p><p className="font-medium">{customer.address || "-"}</p></div>
          </div>
        </Card>
        <Card>
          <div className="space-y-4">
            <div><p className="text-sm text-muted-foreground mb-1">Rating</p><Rating value={customer.rating} readonly /></div>
            <div><p className="text-sm text-muted-foreground mb-1">Tags</p><div className="flex flex-wrap gap-1">{tags.map((t: string, i: number) => <Badge key={i}>{t}</Badge>)}</div></div>
            <div><p className="text-sm text-muted-foreground mb-1">Created</p><p className="text-sm">{formatDate(customer.createdAt)}</p></div>
          </div>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
      {customer.stockTransactions?.length > 0 ? (
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
              {customer.stockTransactions.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                  <TableCell><Badge variant={t.type === "IN" ? "success" : "default"}>{t.type === "IN" ? "Stock In" : "Stock Out"}</Badge></TableCell>
                  <TableCell className="font-medium">{t.product?.name}</TableCell>
                  <TableCell>{t.quantity}</TableCell>
                  <TableCell>{formatCurrency(t.totalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card><p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p></Card>
      )}
    </div>
  );
}
