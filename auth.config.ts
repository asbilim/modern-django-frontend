import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface DjangoAuthResponse {
  access: string;
  refresh: string;
  [key: string]: any;
}

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const { username, password } = credentials;

        try {
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/token/`;
          console.log("Attempting to authenticate against:", apiUrl);

          const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          });

          if (!res.ok) {
            const errorBody = await res.text();
            console.error(
              "Backend authentication failed:",
              res.status,
              errorBody
            );
            throw new Error("Invalid username or password");
          }

          const user = (await res.json()) as DjangoAuthResponse;

          if (user && user.access) {
            const returnedUser = {
              id: "some-unique-id",
              backendTokens: {
                access: user.access,
                refresh: user.refresh,
              },
            };
            return returnedUser;
          }

          throw new Error("Invalid user data from backend.");
        } catch (error) {
          console.error("Error in authorize function:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.backendTokens) {
          token.accessToken = user.backendTokens.access;
          token.refreshToken = user.backendTokens.refresh;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      return session;
    },
  },
} satisfies NextAuthConfig;
