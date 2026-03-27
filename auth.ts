import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Strategy must be JWT for Edge compatibility with middleware
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      // Fetch the username from the database if needed, 
      // or rely on token if it's already there.
      if (token.username && session.user) {
        (session.user as any).username = token.username;
      }
      
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        (token as any).username = (user as any).username;
      }
      return token;
    },
  },
  debug: true,
});
