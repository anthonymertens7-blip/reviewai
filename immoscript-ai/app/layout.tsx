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
              __html: `try{
  if(localStorage.getItem("immoscript-theme")==="dark"){document.documentElement.classList.add("dark")}
  var bg=localStorage.getItem("immoscript-bg");
  if(bg){document.documentElement.setAttribute("data-bg",bg)}
  var a11yRaw=localStorage.getItem("immoscript-a11y");
  if(a11yRaw){
    var a11y=JSON.parse(a11yRaw);
    if(a11y.highContrast){document.documentElement.setAttribute("data-contrast","high")}
    if(a11y.fontSize&&a11y.fontSize!=="normal"){document.documentElement.setAttribute("data-font-size",a11y.fontSize)}
    if(a11y.reduceMotion){document.documentElement.setAttribute("data-reduce-motion","true")}
  }
}catch(e){}`,
            }}
          />
        </head>
        <body className="min-h-screen bg-[linear-gradient(to_bottom,var(--bg-from),var(--bg-to))] bg-fixed font-sans text-gray-900 antialiased dark:text-gray-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
