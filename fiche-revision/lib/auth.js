import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  );
}

export const authOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
};
