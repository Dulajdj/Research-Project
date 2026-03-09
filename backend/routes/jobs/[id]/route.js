import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; // Make sure this path matches your project (e.g., might be @/lib/db)
import Job from "@/models/Job";

export async function GET(request, { params }) {
  try {
    // --- FIX: Await params before destructuring (Required for Next.js 15+) ---
    const { id } = await params;

    await connectDB();
    
    // Use the extracted 'id' to find the job
    const job = await Job.findById(id);
    
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}