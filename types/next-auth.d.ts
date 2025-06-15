import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    is_2fa_enabled?: boolean;
    is_superuser?: boolean;
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
      is_superuser?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    id?: string;
    is_2fa_enabled?: boolean;
    is_superuser?: boolean;
  }
}
