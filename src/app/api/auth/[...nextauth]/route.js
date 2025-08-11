import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/app/lib/prisma"; // Import Prisma client
import { signOut } from "next-auth/react";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid profile email https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/drive.readonly',
          access_type: "offline", prompt: "consent"
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // !!!INFO old code
    // async jwt({ token, account }) {
    //   if (account) {
    //     token.accessToken = account.access_token;
    //   }
    //   return token;
    // },
    // async session({ session, token }) {
    //   session.accessToken = token.accessToken;
    //   return session;
    // },
    async jwt({ token, account }) {
      if (account) {
        // First-time login, save the access_token, its expiry, and the refresh_token
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        }
      } else if (Date.now() < token.expires_at * 1000) {
        // Subsequent logins, but the access_token is still valid
        return token
      } else {
        // Access token has expired, try to refresh it
        if (!token.refresh_token) throw new TypeError("Missing refresh_token")

        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID, // Ensure you are using the correct environment variable
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              grant_type: "refresh_token",
              refresh_token: token.refresh_token,
            }),
          })

          const tokensOrError = await response.json()

          if (!response.ok) throw tokensOrError

          const newTokens = tokensOrError

          return {
            ...token,
            access_token: newTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
            // Some providers only issue refresh tokens once, so preserve it if we didn't get a new one
            refresh_token: newTokens.refresh_token || token.refresh_token,
          }
        } catch (error) {
          signOut({callbackUrl:'/'})
          console.error("Error refreshing access_token", error)
          token.error = "RefreshTokenError" // Set an error so you can handle it on the client-side
          return token
        }
      }
    },
    async session({ session, token }) {
      session.accessToken = token.access_token;
      session.refreshToken = token.refresh_token;
      session.expires = token.expires_at;
      session.error = token.error;
      return session;
    },


    async signIn({ user, account, profile }) {
      // Check if the user is signing in with Google
      let googleUser
      let token
      if (account.provider === "google") {
        // Use Prisma to upsert GoogleUser data
        googleUser = await prisma.googleUser.upsert({
          where: { google_id: user.id }, // Using `user.id` as `id`
          update: {
            google_id: user.id,
            email: profile.email,
            first_name: profile.given_name,
            last_name: profile.family_name,
            profile_picture: profile.picture,
          },
          create: {
            google_id: user.id,  // This is the unique identifier for the Google user
            email: profile.email,
            first_name: profile.given_name,
            last_name: profile.family_name,
            profile_picture: profile.picture,
          },
        });
        const existingToken = await prisma.token.findFirst({
          where: { token_id: googleUser.id },
        });
        if (!existingToken) {
          token = await prisma.token.create({
            data: {
              token_id: googleUser.id,
              token_count: 5,  // Initial token count
            },
          })
          await prisma.googleUser.update({
            where: { id: googleUser.id },
            data: {
              token_id: token.token_id
            }
          })
        }
      }
      return true;
    },
  },
}

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
