import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Advisor "aktualizacja danych" submissions may include attachments; raise
    // the 1MB default for Server Actions.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;

// Enables Cloudflare bindings (D1, KV, R2, etc.) during `next dev` so that
// getCloudflareContext() works locally. Has no effect on production builds.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
