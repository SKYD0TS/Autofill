import prisma from "./../../lib/prisma.js";
import fetch from "node-fetch";

const SCRIPT_RUN_TIME_MS = 55000; // how long worker runs before exiting
const BASE_CHECK_INTERVAL_MS = 1000; // check DB every 1s
const MIN_USER_DELAY_MS = 2000; // 2 seconds between same user's jobs

const lastRunPerUser = new Map(); // email -> last timestamp

async function processJob(job) {
  try {
    const res = await fetch(job.url);
    console.log(res.text())
    const success = res.ok;

    if (success) {
      const googleUser = await prisma.googleUser.findFirst({ where: { email: job.email } });
      if (googleUser) {
        await prisma.token.update({
          where: { token_id: googleUser.id },
          data: {
            token_count: { decrement: 1 },
            last_updated: new Date()
          }
        });
      }
    }

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: success ? "done" : "failed",
        lastTriedAt: new Date()
      }
    });

    console.log(`Processed job ${job.id} (${success ? "SUCCESS" : "FAIL"})`);

    // ✅ Check if user has no pending jobs left
    const pendingCount = await prisma.job.count({
      where: { email: job.email, status: "pending" }
    });
    if (pendingCount === 0) {
      await prisma.googleUser.update({
        where: { email: job.email }, // assumes email is unique in googleUser
        data: { hasPendingJob: false }
      });
      console.log(`Marked ${job.email} as hasPendingJob = false`);
    }

  } catch (err) {
    console.error(`Job ${job.id} failed:`, err.message);
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        lastTriedAt: new Date()
      }
    });
  }
}

(async () => {
  const start = Date.now();
  console.log(`Worker started at ${new Date().toISOString()}`);

  while (Date.now() - start < SCRIPT_RUN_TIME_MS) {
    const now = Date.now();

    const jobs = await prisma.job.findMany({
      where: { status: "pending", runAt: { lte: new Date() } },
      orderBy: { runAt: 'asc' }
    });

    if (jobs.length < 1) {
      console.log("No Pending Jobs");
    }

    for (const job of jobs) {
      const lastRun = lastRunPerUser.get(job.email) || 0;
      const timeSinceLastRun = now - lastRun;

      if (timeSinceLastRun >= MIN_USER_DELAY_MS) {
        lastRunPerUser.set(job.email, Date.now());
        processJob(job); // Not awaited → allows different users in parallel
      }
    }

    await new Promise(r => setTimeout(r, BASE_CHECK_INTERVAL_MS));
  }

  console.log("Worker exiting");
  process.exit(0);
})();
