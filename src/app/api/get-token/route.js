// pages/api/getGoogleUserToken.js
import prisma from "@/app/lib/prisma"; // Import your Prisma client

// app/api/get-token/route.js (App Router)
export async function GET(request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email'); // Using URL API to get query parameters

  console.log('Query params:', email); // Debugging log

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

    const token = await prisma.token.findFirst({
      where: { token_id: googleUser.id },
    });

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
