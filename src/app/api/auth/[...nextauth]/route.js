import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { setCookie } from "nookies";

export const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid profile email https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/drive.readonly',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // Store the access token and refresh token in the JWT token
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        // Store access and refresh tokens in cookies (HTTP-only and secure)
        setCookie(null, 'accessToken', account.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
          path: '/',
        });
        setCookie(null, 'refreshToken', account.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        });
      }
      return token;
    },
    async session({ session, token }) {
      // Add tokens from JWT to the session
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
