import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.businessId = (user as any).businessId;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as any).role = token.role;
      (session.user as any).businessId = token.businessId;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
