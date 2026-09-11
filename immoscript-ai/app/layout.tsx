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
    <ClerkProvider appearance={{ variables: { colorPrimary: "#0284C7" } }}>
      <html lang="fr" className={plusJakartaSans.variable}>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `try{if(localStorage.getItem("immoscript-theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`,
            }}
          />
        </head>
        <body className="min-h-screen bg-gradient-to-b from-[#E3FBFF] to-[#7FD9EC] bg-fixed font-sans text-gray-900 antialiased dark:from-[#0B1220] dark:to-[#111827] dark:text-gray-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
