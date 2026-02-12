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
        try {
          await loginUser({
            email: credentials.email,
            password: credentials.password,
          });
          return {
            id: credentials.email,
            name: credentials.email,
            email: credentials.email,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
});
