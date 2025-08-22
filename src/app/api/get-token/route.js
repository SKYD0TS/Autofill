import { db } from "@/app/lib/db-helpers";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
  const session = await getServerSession(authOptions)
  const email = await session.user.email

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
    });
  }

  try {
    const googleUser = await db.findOne("google_user", { email });

    if (!googleUser) {
      return new Response(
        JSON.stringify({ error: "GoogleUser not found" }),
        { status: 404 }
      );
    }

    const token = await db.findOne("token", { token_id: googleUser.id });

    return new Response(
      JSON.stringify({ token_count: token?.token_count || 0 }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching token:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
