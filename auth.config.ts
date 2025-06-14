import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface DjangoAuthResponse {
  access?: string;
  refresh?: string;
  detail?: string;
  is_2fa_enabled?: boolean;
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
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const { username, password, otp } = credentials as {
          username?: string;
          password?: string;
          otp?: string;
        };

        // If OTP is provided, verify it
        if (otp) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/verify/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password, otp }),
            }
          );

          if (!res.ok) {
            console.error("2FA verification failed:", res.status);
            // This error will be caught by the client and shown in a toast.
            throw new Error("Invalid OTP code.");
          }
          const user = (await res.json()) as DjangoAuthResponse;
          if (!user.access || !user.refresh) {
            throw new Error(
              "2FA verification successful, but no token received."
            );
          }
          return {
            id: username,
            backendTokens: { access: user.access, refresh: user.refresh },
          };
        }

        // Standard username/password login attempt
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/token/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          }
        );

        const tokenData: DjangoAuthResponse = await res.json();

        if (tokenData.is_2fa_enabled) {
          return { id: username, is_2fa_enabled: true };
        }

        if (!res.ok) {
          throw new Error(tokenData.detail || "Authentication failed");
        }

        if (!tokenData.access || !tokenData.refresh) {
          throw new Error("Login successful, but no token received.");
        }

        return {
          id: username,
          backendTokens: {
            access: tokenData.access,
            refresh: tokenData.refresh,
          },
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // This block only runs on sign-in or when the OTP is submitted
        token.id = user.id;

        // Case 1: Login is complete (either no 2FA, or 2FA was just verified)
        if (user.backendTokens) {
          token.accessToken = user.backendTokens.access;
          token.refreshToken = user.backendTokens.refresh;
          token.is_2fa_enabled = false; // Mark 2FA as completed
        }
        // Case 2: 2FA is required, and we are waiting for the OTP
        else if (user.is_2fa_enabled) {
          token.is_2fa_enabled = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

      if (token.id && session.user) {
        session.user.id = token.id;
      }

      // This flag tells the client whether to show the OTP dialog
      session.is_2fa_enabled = token.is_2fa_enabled;

      return session;
    },
  },
} satisfies NextAuthConfig;
