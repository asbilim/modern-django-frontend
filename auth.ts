import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "Required environment variable NEXT_PUBLIC_API_URL is not set."
  );
}

if (!process.env.AUTH_SECRET) {
  throw new Error(
    "Required environment variable AUTH_SECRET is not set. You can generate one with 'openssl rand -hex 32'"
  );
}

// Define the type for our API response
interface DjangoAuthResponse {
  access: string;
  refresh: string;
  [key: string]: any;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize function called with credentials:", credentials);
        if (!credentials?.username || !credentials.password) {
          console.log("No credentials provided, returning null.");
          return null;
        }

        const { username, password } = credentials;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/token/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username,
                password,
              }),
            }
          );

          console.log("Backend response status:", res.status);
          console.log("Backend response ok:", res.ok);

          if (!res.ok) {
            const errorBody = await res.text();
            console.error(
              "Backend authentication failed:",
              res.status,
              errorBody
            );
            return null;
          }

          const user = (await res.json()) as DjangoAuthResponse;
          console.log("Backend response user data:", user);

          if (user && user.access) {
            const returnedUser = {
              id: "some-unique-id",
              backendTokens: {
                access: user.access,
                refresh: user.refresh,
              },
            };
            console.log("Returning user object:", returnedUser);
            return returnedUser;
          }

          console.log("User data from backend is invalid, returning null.");
          return null;
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.backendTokens) {
        token.accessToken = user.backendTokens.access;
        token.refreshToken = user.backendTokens.refresh;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // The JWT token is passed from the jwt callback.
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
