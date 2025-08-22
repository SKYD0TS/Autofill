import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "@/app/lib/db-helpers";

export async function GET() {
  const session = await getServerSession(authOptions)
  const email = await session.user.email

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
    });
  }

  try {
    const googleUser = await db.findOne('google_user', { email });

    if (!googleUser) {
      return new Response(
        JSON.stringify({ error: "GoogleUser not found" }),
        { status: 404 }
      );
    }

    const remainingJobs = (await db.findMany('job', { email, status:"pending" })).length;

    return new Response(
      JSON.stringify({ remainingJobs }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
