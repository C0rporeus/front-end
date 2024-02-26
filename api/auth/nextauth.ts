import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginUser } from "./auth";

export default NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }
        const user = await loginUser(credentials);
        if (user) {
          return { id: String(user.id), name: user.name, email: user.email };
        } else {
          return null;
        }
      },
    }),
  ],
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  callbacks: {
    async jwt(tokenPayload) {
      if (tokenPayload.user) {
        tokenPayload.token.id = tokenPayload.user.id;
      }
      return tokenPayload.token;
    },
    async session(sessionPayload) {
      if (sessionPayload.session.user) {
        sessionPayload.session.user = {
          ...(sessionPayload.session.user as any),
          id: sessionPayload.token.id as string,
        };
      }
      return sessionPayload.session;
    },
  },
});
