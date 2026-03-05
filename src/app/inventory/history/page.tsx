"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: string;
  batchNumber: string;
  orderRef: string;
  note: string;
  product: { name: string; brand: string; unit: string };
  customer: { company: string } | null;
  supplier: { company: string } | null;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    fetch(`/api/stock?${params}`)
      .then((r) => r.json())
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [typeFilter]);

  return (
    <div>
      <PageHeader title="Transaction History" description="View all stock in and stock out records" />

      <Card className="mb-6">
        <div className="flex gap-4 items-center">
          <Select
            label=""
            options={[
              { value: "", label: "All Transactions" },
              { value: "IN", label: "Stock In Only" },
              { value: "OUT", label: "Stock Out Only" },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-48"
          />
          <span className="text-sm text-muted-foreground">
            {transactions.length} records found
          </span>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions" description="Stock in/out transactions will appear here." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Supplier / Customer</TableHead>
                <TableHead>Ref</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
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
                  <TableCell>{t.quantity} {t.product.unit}</TableCell>
                  <TableCell>{formatCurrency(t.unitPrice)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(t.totalAmount)}</TableCell>
                  <TableCell>
                    {t.type === "IN" ? t.supplier?.company || "-" : t.customer?.company || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.type === "IN" ? t.batchNumber : t.orderRef}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[150px] truncate">{t.note || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
