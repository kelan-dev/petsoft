import NextAuth, { NextAuthConfig } from "next-auth";
import credentials from "next-auth/providers/credentials";
import prisma from "./db";
import bcrypt from "bcryptjs";
import { credentialsSchema } from "./validations";

const config = {
  pages: {
    signIn: "/login",
  },
  providers: [
    credentials({
      async authorize(credentials) {
        const validated = credentialsSchema.safeParse(credentials);
        if (!validated.success) {
          console.log("Couldn't validate credentials", validated.error);
          return null;
        }

        const { email, password } = validated.data;

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          console.log("User not found");
          return null;
        }

        const isCorrectPassword = await bcrypt.compare(
          password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          console.log("Invalid credentials");
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const isTryingToAccessApp = request.nextUrl.pathname.includes("/app");

      if (!isLoggedIn) {
        if (isTryingToAccessApp) return false;
        if (!isTryingToAccessApp) return true;
      }

      if (isLoggedIn) {
        if (isTryingToAccessApp) return true;
        if (!isTryingToAccessApp) {
          return Response.redirect(new URL("/app/dashboard", request.nextUrl));
        }
      }

      return false;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(config);
