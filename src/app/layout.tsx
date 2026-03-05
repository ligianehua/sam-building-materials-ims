import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "MaterialIMS - Building Materials Inventory Management",
  description: "Inventory management system for building materials industry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Sidebar />
        <main className="lg:ml-60 min-h-screen pt-14 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full">{children}</div>
        </main>
      </body>
    </html>
  );
}
