// pages/api/getGoogleUserToken.js
import prisma from "@/app/lib/prisma"; // Import your Prisma client
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions)
  const email = await session.user.email
  
  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
    });
  }

  try {
    const googleUser = await prisma.googleUser.findFirst({
      where: { email },
    });

    if (!googleUser) {
      return new Response(
        JSON.stringify({ error: "GoogleUser not found" }),
        { status: 404 }
      );
    }

    const hasPendingJob = googleUser.hasPendingJob

    return new Response(
      JSON.stringify({ hasPendingJob }),
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
