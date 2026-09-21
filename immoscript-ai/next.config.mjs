import { fileURLToPath } from "url";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
};

// withSentryConfig est un no-op utile même sans SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN
// (absents tant que le compte Sentry n'est pas branché) : il désactive alors juste l'upload des
// source maps à la build, sans empêcher Sentry.init (sentry.*.config.ts) de fonctionner à l'exécution.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
