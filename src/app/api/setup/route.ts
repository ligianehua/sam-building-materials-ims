export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Run prisma db push to sync schema
    const { stdout, stderr } = await execAsync("npx prisma db push --skip-generate", {
      env: { ...process.env },
      timeout: 30000,
    });

    return NextResponse.json({
      success: true,
      message: "Database schema synced successfully",
      stdout,
      stderr,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
