import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.BACKEND_URL || "http://localhost:8000";
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "dev-insecure-secret-change-me";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            console.error("[NextAuth] Login failed:", res.status, await res.text().catch(() => ""));
            return null;
          }

          const data = await res.json();

          if (data.user && data.access_token) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              image: data.user.avatar_url ?? null,
              // Store backend JWT on the user object so we can access it in the session
              backendToken: data.access_token,
            };
          }
          return null;
        } catch (err) {
          console.error("[NextAuth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // On initial sign-in with credentials, attach backend token
      if (user) {
        token.id = user.id;
        token.backendToken = (user as any).backendToken;
      }
      // For GitHub OAuth, register/fetch user from backend
      if (account?.provider === "github") {
        try {
          const res = await fetch(`${API_URL}/api/auth/oauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "github",
              email: token.email,
              name: token.name,
              avatar_url: token.picture,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            token.id = data.user.id;
            token.backendToken = data.access_token;
          }
        } catch {
          // silently fail — user will be unauthenticated
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session as any).backendToken = token.backendToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
