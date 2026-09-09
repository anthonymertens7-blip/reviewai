import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImmoScript AI",
  description: "Génération de contenu commercial pour promoteurs immobiliers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
