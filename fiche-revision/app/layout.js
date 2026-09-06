import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "IAexam",
  description: "Génère une fiche de révision à partir de ton cours grâce à l'IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
