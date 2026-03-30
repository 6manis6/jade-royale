import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

const providers: AuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      await connectToDatabase();
      const user = await User.findOne({
        email: String(credentials.email).toLowerCase(),
        emailVerified: true,
      });

      if (!user || !user.passwordHash) {
        return null;
      }

      const isValid = await bcrypt.compare(
        String(credentials.password),
        user.passwordHash,
      );

      if (!isValid) {
        return null;
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" && user.email) {
          await connectToDatabase();

          const email = user.email.toLowerCase();
          const existingUser = await User.findOne({ email });

          if (!existingUser) {
            await User.create({
              name: user.name || "Google User",
              email,
              provider: "google",
              emailVerified: true,
            });
          } else if (!existingUser.emailVerified) {
            existingUser.emailVerified = true;
            if (!existingUser.provider) {
              existingUser.provider = "google";
            }
            await existingUser.save();
          }
        }

        return true;
      } catch {
        return "/login?error=google_signin_failed";
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const target = new URL(url);
        if (target.origin === baseUrl) {
          return url;
        }
      } catch {
        return baseUrl;
      }

      return baseUrl;
    },
    async jwt({ token }) {
      return token;
    },
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
