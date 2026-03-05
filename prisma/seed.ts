import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.financialRecord.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const admin = await prisma.user.create({
    data: { name: "Admin", email: "admin@company.com", password: "admin123", role: "ADMIN" },
  });

  // Create Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        company: "Golden Tile Manufacturing",
        industry: "Tile Manufacturer",
        contactName: "James Wilson",
        phone: "+1-555-0101",
        mobile: "+1-555-0102",
        address: "123 Industrial Ave, Detroit, MI 48201",
        tags: JSON.stringify(["Certified", "Domestic"]),
        rating: 5,
      },
    }),
    prisma.supplier.create({
      data: {
        company: "Pacific Paint Distributors",
        industry: "Paint Distributor",
        contactName: "Sarah Chen",
        phone: "+1-555-0201",
        mobile: "+1-555-0202",
        address: "456 Commerce Blvd, Los Angeles, CA 90001",
        tags: JSON.stringify(["Import", "Wholesale"]),
        rating: 4,
      },
    }),
    prisma.supplier.create({
      data: {
        company: "Midwest Cement Corp",
        industry: "Cement Manufacturer",
        contactName: "Robert Martinez",
        phone: "+1-555-0301",
        mobile: "+1-555-0302",
        address: "789 Factory Rd, Chicago, IL 60601",
        tags: JSON.stringify(["Certified", "Local"]),
        rating: 4,
      },
    }),
    prisma.supplier.create({
      data: {
        company: "Premier Plumbing Supply",
        industry: "Plumbing Distributor",
        contactName: "Emily Brown",
        phone: "+1-555-0401",
        mobile: "+1-555-0402",
        address: "321 Warehouse Dr, Houston, TX 77001",
        tags: JSON.stringify(["Wholesale", "Fast Delivery"]),
        rating: 3,
      },
    }),
    prisma.supplier.create({
      data: {
        company: "Nordic Hardware International",
        industry: "Hardware Importer",
        contactName: "Thomas Anderson",
        phone: "+1-555-0501",
        mobile: "+1-555-0502",
        address: "654 Import Way, New York, NY 10001",
        tags: JSON.stringify(["Import", "Premium"]),
        rating: 5,
      },
    }),
  ]);

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        company: "Sunrise Construction Group",
        industry: "Residential Construction",
        contactName: "Michael Davis",
        phone: "+1-555-1001",
        mobile: "+1-555-1002",
        address: "100 Builder Lane, Miami, FL 33101",
        tags: JSON.stringify(["VIP", "Wholesale"]),
        rating: 5,
      },
    }),
    prisma.customer.create({
      data: {
        company: "Metro Renovation Services",
        industry: "Renovation",
        contactName: "Lisa Johnson",
        phone: "+1-555-1101",
        mobile: "+1-555-1102",
        address: "200 Remodel St, Boston, MA 02101",
        tags: JSON.stringify(["Regular", "Retail"]),
        rating: 4,
      },
    }),
    prisma.customer.create({
      data: {
        company: "Grand Commercial Builders",
        industry: "Commercial Construction",
        contactName: "David Wang",
        phone: "+1-555-1201",
        mobile: "+1-555-1202",
        address: "300 Commerce Park, San Francisco, CA 94101",
        tags: JSON.stringify(["VIP", "Wholesale", "Long-term"]),
        rating: 5,
      },
    }),
    prisma.customer.create({
      data: {
        company: "HomeStyle Interiors",
        industry: "Interior Design",
        contactName: "Jennifer Lee",
        phone: "+1-555-1301",
        mobile: "+1-555-1302",
        address: "400 Design Ave, Seattle, WA 98101",
        tags: JSON.stringify(["Retail", "Designer"]),
        rating: 4,
      },
    }),
    prisma.customer.create({
      data: {
        company: "Eagle Property Development",
        industry: "Property Development",
        contactName: "Chris Taylor",
        phone: "+1-555-1401",
        mobile: "+1-555-1402",
        address: "500 Developer Blvd, Phoenix, AZ 85001",
        tags: JSON.stringify(["Wholesale", "New"]),
        rating: 3,
      },
    }),
  ]);

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: { name: "Porcelain Floor Tile 800x800", brand: "Golden Tile", category: "Tiles", model: "GT-800P", specification: "800x800mm", color: "Beige Marble", unit: "piece", quantity: 500, purchasePrice: 8.5, sellingPrice: 15.0, lowStockAlert: 50, warehouse: "Warehouse A" },
    }),
    prisma.product.create({
      data: { name: "Ceramic Wall Tile 300x600", brand: "Golden Tile", category: "Tiles", model: "GT-3060W", specification: "300x600mm", color: "White", unit: "piece", quantity: 800, purchasePrice: 3.2, sellingPrice: 6.5, lowStockAlert: 100, warehouse: "Warehouse A" },
    }),
    prisma.product.create({
      data: { name: "Interior Latex Paint 5L", brand: "Pacific Paint", category: "Paint", model: "PP-IL5", specification: "5L bucket", color: "White", unit: "bucket", quantity: 120, purchasePrice: 22.0, sellingPrice: 38.0, lowStockAlert: 20, warehouse: "Warehouse B" },
    }),
    prisma.product.create({
      data: { name: "Exterior Weather Paint 20L", brand: "Pacific Paint", category: "Paint", model: "PP-EW20", specification: "20L drum", color: "Ivory", unit: "drum", quantity: 45, purchasePrice: 65.0, sellingPrice: 110.0, lowStockAlert: 10, warehouse: "Warehouse B" },
    }),
    prisma.product.create({
      data: { name: "Portland Cement Type I", brand: "Midwest Cement", category: "Cement", model: "MC-PT1", specification: "50kg bag", color: "Gray", unit: "bag", quantity: 300, purchasePrice: 5.5, sellingPrice: 9.0, lowStockAlert: 50, warehouse: "Warehouse C" },
    }),
    prisma.product.create({
      data: { name: "PVC Pipe 4inch", brand: "Premier Plumb", category: "Pipes", model: "PL-PVC4", specification: "4inch x 3m", color: "White", unit: "piece", quantity: 200, purchasePrice: 4.8, sellingPrice: 8.5, lowStockAlert: 30, warehouse: "Warehouse C" },
    }),
    prisma.product.create({
      data: { name: "Copper Pipe 1/2inch", brand: "Premier Plumb", category: "Pipes", model: "PL-CU12", specification: "1/2inch x 2m", color: "Copper", unit: "piece", quantity: 150, purchasePrice: 12.0, sellingPrice: 20.0, lowStockAlert: 25, warehouse: "Warehouse C" },
    }),
    prisma.product.create({
      data: { name: "Stainless Steel Hinge", brand: "Nordic Hardware", category: "Hardware", model: "NH-SSH01", specification: "4inch", color: "Silver", unit: "pair", quantity: 8, purchasePrice: 3.5, sellingPrice: 6.0, lowStockAlert: 50, warehouse: "Warehouse D" },
    }),
    prisma.product.create({
      data: { name: "Door Lock Set Premium", brand: "Nordic Hardware", category: "Hardware", model: "NH-DLS01", specification: "Standard", color: "Chrome", unit: "set", quantity: 5, purchasePrice: 28.0, sellingPrice: 48.0, lowStockAlert: 10, warehouse: "Warehouse D" },
    }),
    prisma.product.create({
      data: { name: "Waterproof Membrane Roll", brand: "Pacific Paint", category: "Waterproofing", model: "PP-WM10", specification: "1m x 10m roll", color: "Gray", unit: "roll", quantity: 60, purchasePrice: 35.0, sellingPrice: 58.0, lowStockAlert: 10, warehouse: "Warehouse B" },
    }),
  ]);

  // Create Stock Transactions (historical data for past 6 months)
  const now = new Date();
  const transactions = [];

  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const baseDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);

    // Stock In transactions
    for (let i = 0; i < 3; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const qty = Math.floor(Math.random() * 100) + 20;
      const date = new Date(baseDate.getTime() + Math.random() * 28 * 24 * 60 * 60 * 1000);

      transactions.push(
        prisma.stockTransaction.create({
          data: {
            type: "IN",
            productId: product.id,
            supplierId: supplier.id,
            quantity: qty,
            unitPrice: product.purchasePrice,
            totalAmount: qty * product.purchasePrice,
            date,
            batchNumber: `B${String(6 - monthsAgo).padStart(2, "0")}${String(i + 1).padStart(3, "0")}`,
          },
        })
      );
    }

    // Stock Out transactions
    for (let i = 0; i < 4; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const qty = Math.floor(Math.random() * 50) + 5;
      const date = new Date(baseDate.getTime() + Math.random() * 28 * 24 * 60 * 60 * 1000);

      transactions.push(
        prisma.stockTransaction.create({
          data: {
            type: "OUT",
            productId: product.id,
            customerId: customer.id,
            quantity: qty,
            unitPrice: product.sellingPrice,
            totalAmount: qty * product.sellingPrice,
            date,
            orderRef: `ORD-${String(6 - monthsAgo).padStart(2, "0")}${String(i + 1).padStart(3, "0")}`,
          },
        })
      );
    }
  }

  const createdTransactions = await Promise.all(transactions);

  // Create Financial Records from transactions
  const financialRecords = createdTransactions.map((t) =>
    prisma.financialRecord.create({
      data: {
        type: t.type === "IN" ? "EXPENSE" : "INCOME",
        category: t.type === "IN" ? "Purchase" : "Sales",
        amount: t.totalAmount,
        description: `Stock ${t.type === "IN" ? "In" : "Out"} - ${t.quantity} units`,
        relatedType: t.type === "IN" ? "STOCK_IN" : "STOCK_OUT",
        relatedId: t.id,
        date: t.date,
      },
    })
  );

  // Add some additional expense records
  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const baseDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    financialRecords.push(
      prisma.financialRecord.create({
        data: {
          type: "EXPENSE",
          category: "Rent",
          amount: 3500,
          description: "Warehouse monthly rent",
          date: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.financialRecord.create({
        data: {
          type: "EXPENSE",
          category: "Salary",
          amount: 8500,
          description: "Staff salaries",
          date: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.financialRecord.create({
        data: {
          type: "EXPENSE",
          category: "Shipping",
          amount: Math.floor(Math.random() * 800) + 400,
          description: "Delivery and logistics",
          date: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000),
        },
      })
    );
  }

  await Promise.all(financialRecords);

  // Create Invoices (Receivable and Payable)
  await Promise.all([
    prisma.invoice.create({
      data: {
        type: "RECEIVABLE",
        customerId: customers[0].id,
        amount: 12500,
        paidAmount: 5000,
        status: "PARTIAL",
        dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        description: "Tile order - Phase 1 payment",
      },
    }),
    prisma.invoice.create({
      data: {
        type: "RECEIVABLE",
        customerId: customers[2].id,
        amount: 28000,
        paidAmount: 0,
        status: "PENDING",
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        description: "Commercial project materials",
      },
    }),
    prisma.invoice.create({
      data: {
        type: "RECEIVABLE",
        customerId: customers[1].id,
        amount: 4500,
        paidAmount: 4500,
        status: "PAID",
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        description: "Renovation supplies",
      },
    }),
    prisma.invoice.create({
      data: {
        type: "RECEIVABLE",
        customerId: customers[3].id,
        amount: 6800,
        paidAmount: 0,
        status: "PENDING",
        dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        description: "Interior design project order",
      },
    }),
    prisma.invoice.create({
      data: {
        type: "PAYABLE",
        supplierId: suppliers[0].id,
        amount: 18000,
        paidAmount: 18000,
        status: "PAID",
        dueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        description: "Tile bulk purchase Q1",
      },
    }),
    prisma.invoice.create({
      data: {
        type: "PAYABLE",
        supplierId: suppliers[1].id,
        amount: 9500,
        paidAmount: 4000,
        status: "PARTIAL",
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        description: "Paint supply order",
      },
    }),
    prisma.invoice.create({
      data: {
        type: "PAYABLE",
        supplierId: suppliers[2].id,
        amount: 7200,
        paidAmount: 0,
        status: "PENDING",
        dueDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        description: "Cement delivery batch",
      },
    }),
    prisma.invoice.create({
      data: {
        type: "PAYABLE",
        supplierId: suppliers[4].id,
        amount: 3800,
        paidAmount: 0,
        status: "PENDING",
        dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        description: "Hardware import shipment",
      },
    }),
  ]);

  console.log("Seed completed successfully!");
  console.log(`Created: 1 user, ${suppliers.length} suppliers, ${customers.length} customers, ${products.length} products`);
  console.log(`Created: ${createdTransactions.length} stock transactions, financial records, and invoices`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
