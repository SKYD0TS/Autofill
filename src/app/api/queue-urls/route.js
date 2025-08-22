import { db } from "@/app/lib/db-helpers";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    const email = session.user.email
    const { urls, delay = 1000 } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Invalid URLs array" }, { status: 400 });
    }

    const googleUser = await db.findOne('google_user', { email });

    if (!googleUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (googleUser.has_pending_job) {
      return NextResponse.json({ error: "User still have unsent response" }, { status: 400 });
    }
    await db.updateOne("google_user", { id: googleUser.id }, {
      has_pending_job: true
    });


    const token = await db.findOne("token", { token_id: googleUser.id });
    if (!token) {
      return NextResponse.json({ error: "Token record not found" }, { status: 404 });
    }

    const pendingCount = (await db.findMany("job", { email, status: "pending" })).length;
    console.log({pendingCount})
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
    const jobs = urls.map((u, i) => [
      u,
      email,
      new Date(now.getTime() + delay * 1000 * i),
      "pending"
    ]);

    // Prepare a single bulk INSERT
    if (jobs.length > 0) {
      const placeholders = jobs.map(() => "(?, ?, ?, ?)").join(", ");
      const flatValues = jobs.flat();

      await db.query(
        `INSERT INTO job (url, email, run_at, status) VALUES ${placeholders}`,
        flatValues
      );
    }


    return NextResponse.json({ message: "URLs queued", queued: urls.length }, { status: 200 });
  } catch (err) {
    console.error("Queue API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
