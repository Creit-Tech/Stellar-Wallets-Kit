import { defineConfig } from "vite";

// @stellar/stellar-sdk expects Node globals in the browser; `Buffer` is polyfilled in
// index.html and `global` is aliased here, the same setup the other kit examples use.
export default defineConfig({
  define: { global: "globalThis" },
  server: { port: 5273, strictPort: true },
  preview: { port: 5273, strictPort: true },
  // The kit is linked from the local build (link:../../src/dist) and resolves its own
  // deps from the fork tree, so without dedupe Vite can bundle a second copy of
  // stellar-sdk/stellar-base, the noble libs, or @soropass/core for the linked package.
  // Two copies means an `xdr.Int64` built by one is rejected by the other's writer
  // ("not a Hyper") and secp256r1 objects cross a copy boundary. Force a single instance
  // of each so the app and the linked kit share @soropass/core (from npm) and stellar-sdk.
  // A published consumer of both packages has one copy already and needs none of this.
  resolve: {
    dedupe: [
      "@soropass/core",
      "@stellar/stellar-sdk",
      "@stellar/stellar-base",
      "@noble/curves",
      "@noble/hashes",
    ],
  },
});
