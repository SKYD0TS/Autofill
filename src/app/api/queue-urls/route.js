// /app/api/queue-urls/route.js  (Next.js App Router style)
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { urls, email, delay = 1000 } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Invalid URLs array" }, { status: 400 });
    }

    const googleUser = await prisma.googleUser.findFirst({ where: { email } });
    
    if(googleUser.hasPendingJob){
      return NextResponse.json({ error: "User still have unsent response" }, { status: 400 });
    }
    if (!googleUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await prisma.googleUser.update({
      where: {id: googleUser.id},
      data: {
        hasPendingJob: true
      }
    })

    const token = await prisma.token.findFirst({ where: { token_id: googleUser.id } });
    if (!token) {
      return NextResponse.json({ error: "Token record not found" }, { status: 404 });
    }

    // Count already-pending jobs for this user (treat them as reserved)
    const pendingCount = await prisma.job.count({
      where: {
        email,
        status: { in: ["pending", "processing"] },
      },
    });

    const available = token.token_count - pendingCount;
    if (available < urls.length) {
      return NextResponse.json({
        error: "Not enough tokens to queue all URLs",
        available,
        requested: urls.length,
      }, { status: 402 });
    }

    // Create job rows (staggered runAt by delay)
    const now = new Date();
    const jobs = urls.map((u, i) => ({
      url: u,
      email,
      runAt: new Date(now.getTime() + delay * 1000 * i),
      status: "pending",
    }));

    // Use createMany for speed
    await prisma.job.createMany({ data: jobs });

    return NextResponse.json({ message: "URLs queued", queued: urls.length }, { status: 200 });
  } catch (err) {
    console.error("Queue API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
