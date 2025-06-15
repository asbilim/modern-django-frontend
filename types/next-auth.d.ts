import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    is_2fa_enabled?: boolean;
    backendTokens?: {
      access: string;
      refresh: string;
    };
  }

  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    is_2fa_enabled?: boolean;
    user?: {
      id?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    id?: string;
    is_2fa_enabled?: boolean;
  }
}
