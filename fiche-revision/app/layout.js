import "./globals.css";

export const metadata = {
  title: "Fiche de Révision IA",
  description: "Génère une fiche de révision à partir de ton cours grâce à l'IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
