import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    // Tests d'intégration ciblés contre une vraie base Postgres locale (DATABASE_URL) plutôt qu'un
    // mock Prisma : ce sont précisément des comportements que seul le vrai moteur SQL exerce
    // fidèlement (ordre NULLS FIRST/LAST, verrouillage de ligne sous accès concurrent) — un mock
    // aurait masqué les deux bugs que ces tests couvrent.
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "."),
    },
  },
});
