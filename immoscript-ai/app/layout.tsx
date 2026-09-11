import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ImmoScript AI",
  description: "Génération de contenu commercial pour promoteurs immobiliers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: "#151F6D" } }}>
      <html lang="fr" className={plusJakartaSans.variable}>
        <body className="min-h-screen bg-[#B4B5DF] font-sans text-gray-900 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
