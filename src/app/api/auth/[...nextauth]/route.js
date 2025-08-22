import {db} from "@/app/lib/db-helpers"

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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
                    signOut({ callbackUrl: '/' })
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
                // upsert googleUser
                await db.query(`
                    INSERT INTO google_user (google_id, email, first_name, last_name, profile_picture)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    email = VALUES(email),
                    first_name = VALUES(first_name),
                    last_name = VALUES(last_name),
                    profile_picture = VALUES(profile_picture)
                    `,
                    [
                        user.id,
                        profile.email,
                        profile.given_name,
                        profile.family_name,
                        profile.picture,
                    ]
                );
                // fetch the googleUser (whether created or updated)
                const [googleUser] = await db.query(
                    `SELECT * FROM google_user WHERE google_id = ? LIMIT 1`,
                    [user.id]
                );

                const [existingToken] = await db.query(
                    `SELECT * FROM token WHERE token_id = ? LIMIT 1`,
                    [googleUser.id]
                );

                if (!existingToken) {
                    await db.query(
                        `INSERT INTO token (token_id, token_count) VALUES (?, ?)`,
                        [googleUser.id, 5]
                    );

                    const [token] = await db.query(
                        `SELECT * FROM token WHERE token_id = ? LIMIT 1`,
                        [googleUser.id]
                    );

                    await db.query(
                        `UPDATE google_user SET token_id = ? WHERE id = ?`,
                        [token.token_id, googleUser.id]
                    );
                }
            }
            return true;
        },
    },
}

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
