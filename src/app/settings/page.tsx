"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings as SettingsIcon,
  Building2,
  Download,
  Shield,
  Users,
  Bell,
} from "lucide-react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Sam Building Materials Co.");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("10");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async (type: string) => {
    try {
      const endpoints: Record<string, string> = {
        products: "/api/products",
        customers: "/api/customers",
        suppliers: "/api/suppliers",
        finance: "/api/finance",
      };
      const res = await fetch(endpoints[type]);
      const data = await res.json();

      if (!data.length) {
        alert(`No ${type} data to export.`);
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row: Record<string, unknown>) =>
          headers.map((h) => {
            const val = String(row[h] ?? "");
            return val.includes(",") ? `"${val}"` : val;
          }).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage system configuration and preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              Company Information
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <Input
                label="Tax Rate (%)"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
            <Button onClick={handleSave}>
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </Card>

        {/* Inventory Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={18} className="text-warning" />
              Inventory Settings
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Default Low Stock Threshold"
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              placeholder="10"
            />
            <p className="text-sm text-muted-foreground">
              Products with quantity at or below this threshold will trigger low stock alerts on the dashboard.
            </p>
            <Button onClick={handleSave}>
              {saved ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download size={18} className="text-success" />
              Data Export
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Export your data as CSV files for backup or analysis.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleExport("products")}>
                <Download size={14} />
                Export Products
              </Button>
              <Button variant="outline" onClick={() => handleExport("customers")}>
                <Download size={14} />
                Export Customers
              </Button>
              <Button variant="outline" onClick={() => handleExport("suppliers")}>
                <Download size={14} />
                Export Suppliers
              </Button>
              <Button variant="outline" onClick={() => handleExport("finance")}>
                <Download size={14} />
                Export Finance
              </Button>
            </div>
          </div>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} className="text-info" />
              User Management
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="border border-border rounded-lg divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-medium">Admin</p>
                    <p className="text-xs text-muted-foreground">admin@company.com</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Admin
                </span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-success/80 flex items-center justify-center text-white text-sm font-bold">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-medium">Manager</p>
                    <p className="text-xs text-muted-foreground">manager@company.com</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  Manager
                </span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-400 flex items-center justify-center text-white text-sm font-bold">
                    S
                  </div>
                  <div>
                    <p className="text-sm font-medium">Staff</p>
                    <p className="text-xs text-muted-foreground">staff@company.com</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Staff
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} className="text-destructive" />
              System Information
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="text-sm font-semibold mt-1">1.0.0</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Database</p>
              <p className="text-sm font-semibold mt-1">SQLite</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Framework</p>
              <p className="text-sm font-semibold mt-1">Next.js 15</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Last Backup</p>
              <p className="text-sm font-semibold mt-1">Never</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
