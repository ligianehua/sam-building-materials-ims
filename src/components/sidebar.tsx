"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  DollarSign,
  Settings,
  ChevronDown,
  PackagePlus,
  PackageMinus,
  History,
  FileText,
  Receipt,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: <Package size={20} />,
    children: [
      { label: "Products", href: "/inventory", icon: <Package size={16} /> },
      { label: "Stock In", href: "/inventory/stock-in", icon: <PackagePlus size={16} /> },
      { label: "Stock Out", href: "/inventory/stock-out", icon: <PackageMinus size={16} /> },
      { label: "History", href: "/inventory/history", icon: <History size={16} /> },
    ],
  },
  {
    label: "Customers",
    href: "/customers",
    icon: <Users size={20} />,
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: <Truck size={20} />,
  },
  {
    label: "Finance",
    href: "/finance",
    icon: <DollarSign size={20} />,
    children: [
      { label: "Overview", href: "/finance", icon: <BarChart3 size={16} /> },
      { label: "Records", href: "/finance/records", icon: <FileText size={16} /> },
      { label: "Receivable", href: "/finance/receivable", icon: <Receipt size={16} /> },
      { label: "Payable", href: "/finance/payable", icon: <CreditCard size={16} /> },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings size={20} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Inventory: true,
    Finance: true,
  });

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-accent">
        <Package className="text-primary mr-2.5" size={24} />
        <span className="text-lg font-bold tracking-tight">MaterialIMS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item) => (
          <div key={item.label} className="mb-0.5">
            {item.children ? (
              <>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-white"
                      : "text-slate-300 hover:bg-sidebar-accent/50 hover:text-white"
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform",
                      expanded[item.label] ? "rotate-180" : ""
                    )}
                  />
                </button>
                {expanded[item.label] && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                          pathname === child.href
                            ? "bg-primary text-white font-medium"
                            : "text-slate-400 hover:bg-sidebar-accent/50 hover:text-white"
                        )}
                      >
                        {child.icon}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href) && !item.children
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-sidebar-accent/50 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-accent">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin</p>
            <p className="text-xs text-slate-400 truncate">admin@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
