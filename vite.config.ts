// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Force the Nitro Cloudflare Worker build outside Lovable. By default the
  // Lovable config only runs Nitro inside its sandbox (auto-detected), so a
  // self-hosted `bun run build` would emit a client-only bundle with no SSR
  // Worker. Setting `nitro: true` makes the build produce dist/ +
  // dist/server/wrangler.json (cloudflare-module preset, nodejs_compat) for
  // standalone deploys to our own Cloudflare account.
  nitro: true,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
