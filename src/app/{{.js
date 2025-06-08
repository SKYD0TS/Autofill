import { getSession } from "next-auth/react";

export async function middleware(req) {
  const session = await getSession({ req });

  // Redirect to login if the session does not exist
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next(); // Allow the request to continue
}
